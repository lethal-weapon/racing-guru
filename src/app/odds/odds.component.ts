import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {RestRepository} from '../model/rest.repository';
import {WebsocketService} from '../model/websocket.service';
import {Racecard} from '../model/racecard.model';
import {Starter} from '../model/starter.model';
import {SingularSignal, CombinationSignal} from '../model/signal.model';
import {COLORS} from '../util/strings';
import {
  THREE_SECONDS,
  MAX_RACE_PER_MEETING,
  DEFAULT_MIN_QPL_ODDS,
  DEFAULT_MAX_QPL_ODDS,
  DEFAULT_MIN_QIN_ODDS,
  DEFAULT_MAX_QIN_ODDS,
  DEFAULT_MIN_FCT_ODDS,
  DEFAULT_MAX_FCT_ODDS,
  DEFAULT_MIN_DBL_ODDS,
  DEFAULT_MAX_DBL_ODDS,
  QPL_ODDS_STEP,
  QIN_ODDS_STEP,
  FCT_ODDS_STEP,
  DBL_ODDS_STEP,
  QIN_FCT_DIFF_RATE
} from '../util/numbers';
import {
  getMaxRace,
  getPlacing,
  getPlacingColor,
  getSignalColor,
  getRaceBadgeStyle,
  getStarterQQPWinPlaceOdds,
  getStarterWinPlaceOdds,
  getStarters,
  getCurrentMeeting,
  isFavorite,
  toRelativeTime
} from '../util/functions';

interface OddsRange {
  minQPL: number,
  maxQPL: number,
  minQIN: number,
  maxQIN: number,
  minFCT: number,
  maxFCT: number
  minDBL: number,
  maxDBL: number
}

interface Bet {
  qpl: number[][],
  qin: number[][],
  fct: number[][],
  dbl: number[][]
}

interface RangeControl {
  pool: string,
  step: number,
  minOdds: number,
  maxOdds: number
}

const DEFAULT_RANGE: OddsRange = {
  minQPL: DEFAULT_MIN_QPL_ODDS,
  maxQPL: DEFAULT_MAX_QPL_ODDS,
  minQIN: DEFAULT_MIN_QIN_ODDS,
  maxQIN: DEFAULT_MAX_QIN_ODDS,
  minFCT: DEFAULT_MIN_FCT_ODDS,
  maxFCT: DEFAULT_MAX_FCT_ODDS,
  minDBL: DEFAULT_MIN_DBL_ODDS,
  maxDBL: DEFAULT_MAX_DBL_ODDS
}

const DEFAULT_BET: Bet = {
  qpl: [],
  qin: [],
  fct: [],
  dbl: []
}

@Component({
  selector: 'app-odds',
  templateUrl: './odds.component.html'
})
export class OddsComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;
  trackModeOn: boolean = false;
  onDoubleTable: boolean = false;
  hoveredJockey: string = '';

  bets: Map<number, Bet> = new Map();
  ranges: Map<number, OddsRange> = new Map();
  trashes: Map<number, number[]> = new Map();

  protected readonly isFavorite = isFavorite;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getPlacingColor = getPlacingColor;
  protected readonly getSignalColor = getSignalColor;
  protected readonly getStarters = getStarters;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;
  protected readonly getStarterQQPWinPlaceOdds = getStarterQQPWinPlaceOdds;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService,
    private clipboard: Clipboard
  ) {
    socket.addCloseCallback(() => socket.racecards.unsubscribe());
    socket.addReconnectCallback(() =>
      socket.racecards.subscribe(data => this.racecards = data));

    socket.racecards.subscribe(data => this.racecards = data);
  }

  ngOnInit(): void {
    setInterval(() => {
      this.socket.racecards.next([]);
      if (this.trackModeOn) this.trackQuinellaAndForecast();
    }, THREE_SECONDS);

    this.repo.fetchMeetingHorses();
    this.repo.fetchConnections();

    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.bets.set(race, {...DEFAULT_BET});
      this.ranges.set(race, {...DEFAULT_RANGE});
      this.trashes.set(race, []);
    }
  }

  resetBets = () =>
    this.bets.set(this.activeRace, {...DEFAULT_BET})

  resetFavorites = () =>
    this.repo.saveFavorite({
      meeting: getCurrentMeeting(this.racecards),
      race: this.activeRace,
      favorites: []
    })

  resetSelections = () =>
    this.repo.saveSelection({
      meeting: getCurrentMeeting(this.racecards),
      race: this.activeRace,
      selections: []
    });

  copyBets = (pool: string = '') => {
    let bets = '';
    for (const [key, value] of Object.entries(this.activeBet)) {
      const cmd = key.startsWith('f') ? 'fs' : key;
      const sep = cmd === 'fs' ? '-' : (cmd === 'dbl' ? '/' : ',');

      // @ts-ignore
      const poolBets = (value || []).map(c => `${cmd}:${c.join(sep)};`).join(``);

      if (pool === '' || pool.toUpperCase() === key.toUpperCase()) {
        bets = bets.concat(poolBets);
      }
    }
    this.clipboard.copy(bets);
  }

  copyAsBankerBets = (betType: string) => {
    const pairs = [...this.activeBet.qin, ...this.activeBet.qpl]
      .map(p => p.sort((o1, o2) => o1 - o2))
      .sort((p1, p2) => p1[0] - p2[0] || p1[1] - p2[1])
      .map(p => `${p[0]},${p[1]}`)
      .filter((p, i, a) => a.indexOf(p) === i);

    let ff = pairs.map(p => `ff:${p}>`).join(`;`);
    let tri = pairs.map(p => `tri:${p}>`).join(`;`);
    let tbm = pairs.map(p => `tbm:${p}>`).join(`;`);
    let qbm = pairs.map(p => `qbm:${p}>`).join(`;`);

    switch (betType) {
      case 'FF':
        this.clipboard.copy(ff);
        break
      case 'TRI':
        this.clipboard.copy(tri);
        break
      case 'TBM':
        this.clipboard.copy(tbm);
        break
      case 'QBM':
        this.clipboard.copy(qbm);
        break
      case 'ALL':
        this.clipboard.copy([tri, tbm, ff, qbm].join(`;`));
        break
      default:
        break
    }
  }

  copyMultiBankerBets = (betType: string) => {
    const ordersByPlacing = Array(4).fill(1)
      .map((e, index) => 1 + index)
      .map(p =>
        this.activeRacecard.selections
          .filter(s => s.placing === p)
          .map(s => s.order)
          .sort((o1, o2) => o1 - o2)
          .join()
      );

    let fmb = `fmb:${ordersByPlacing.slice(0, 2).join('>')}`;
    let tmb = `tmb:${ordersByPlacing.slice(0, 3).join('>')}`;
    let qmb = `qmb:${ordersByPlacing.join('>')}`;

    const fctBets = this.getMultiBankerBets('FMB').length;
    const tceBets = this.getMultiBankerBets('TMB').length;
    const qttBets = this.getMultiBankerBets('QMB').length;

    if (fctBets <= 12) fmb = fmb.concat(`/$10`);
    else fmb = fmb.concat(`|$120`);

    if (tceBets <= 12) tmb = tmb.concat(`/$10`);
    else if (tceBets <= 18) tmb = tmb.concat(`/$8`);
    else if (tceBets <= 24) tmb = tmb.concat(`/$6`);
    else if (tceBets <= 30) tmb = tmb.concat(`/$5`);
    else if (tceBets <= 36) tmb = tmb.concat(`/$4`);
    else if (tceBets <= 48) tmb = tmb.concat(`/$3`);
    else tmb = tmb.concat(`/$2`);

    if (qttBets <= 16) qmb = qmb.concat(`/$10`);
    else if (qttBets <= 24) qmb = qmb.concat(`/$6`);
    else if (qttBets <= 30) qmb = qmb.concat(`/$5`);
    else if (qttBets <= 36) qmb = qmb.concat(`/$4`);
    else if (qttBets <= 48) qmb = qmb.concat(`/$3`);
    else if (qttBets <= 72) qmb = qmb.concat(`/$2`);
    else qmb = qmb.concat(`/$1`);

    switch (betType) {
      case 'FMB':
        this.clipboard.copy(fmb);
        break
      case 'TMB':
        this.clipboard.copy(tmb);
        break
      case 'QMB':
        this.clipboard.copy(qmb);
        break
      case 'ALL':
        this.clipboard.copy([fmb, tmb, qmb].join(';'));
        break
      default:
        break
    }
  }

  getMultiBankerBets = (betType: string): number[][] => {
    let bets: number[][] = [];
    const ordersByPlacing = Array(4).fill(1)
      .map((e, index) => 1 + index)
      .map(p =>
        this.activeRacecard.selections
          .filter(s => s.placing === p)
          .map(s => s.order)
      );

    for (let i = 0; i < ordersByPlacing[0].length; i++) {
      const winner = ordersByPlacing[0][i];

      for (let j = 0; j < ordersByPlacing[1].length; j++) {
        const second = ordersByPlacing[1][j];
        if (second == winner) continue;

        if (betType === 'FMB') {
          bets.push([winner, second]);
          continue;
        }

        for (let k = 0; k < ordersByPlacing[2].length; k++) {
          const third = ordersByPlacing[2][k];
          if ([winner, second].includes(third)) continue;

          if (betType === 'TMB') {
            bets.push([winner, second, third]);
            continue;
          }

          for (let l = 0; l < ordersByPlacing[3].length; l++) {
            const fourth = ordersByPlacing[3][l];
            if ([winner, second, third].includes(fourth)) continue;
            bets.push([winner, second, third, fourth]);
          }
        }
      }
    }

    return bets;
  }

  trackQuinellaAndForecast = () => {
    let qin: number[][] = [];
    let fct: number[][] = [];
    const qpl: number[][] = this.activeBet.qpl;
    const dbl: number[][] = this.activeBet.dbl;
    const starters = getStarters(this.activeRacecard);

    for (let i = 0; i < starters.length; i++) {
      const starterA = starters[i];
      const orderA = starterA.order;
      if (this.isTrash(starterA)) continue;

      for (let j = i + 1; j < starters.length; j++) {
        const starterB = starters[j];
        const orderB = starterB.order;
        if (this.isTrash(starterB)) continue;

        // skip non-connected combinations
        if (!this.isPeopleConnected(starterA, starterB)) continue;

        // skip combinations that have signals already
        const signalAB = this.getCombinationSignals(starterA, starterB);
        const signalBA = this.getCombinationSignals(starterB, starterA);
        if (signalAB[0].length > 0) continue;

        const qqpWithinRange = this.isQQPOddsWithinRange(starterA, starterB);
        const fctWithinRange = this.isFCTOddsWithinRange(starterA, starterB);
        const conditions = [
          qqpWithinRange[0],
          fctWithinRange[0],
          fctWithinRange[1],
        ];

        if (conditions.some(c => !c)) continue;

        const Q2 = 2 * this.getStarterQQPOdds(starterA, starterB)[0];
        const F1 = this.getStarterFCTOdds(starterA, starterB)[0];
        const F2 = this.getStarterFCTOdds(starterA, starterB)[1];
        let switch1 = false;
        let switch2 = false;

        if (Math.abs(1 - Q2 / F1) <= QIN_FCT_DIFF_RATE && signalAB[2].length == 0) {
          switch1 = true;
          fct.push([orderA, orderB]);
        }
        if (Math.abs(1 - Q2 / F2) <= QIN_FCT_DIFF_RATE && signalBA[2].length == 0) {
          switch2 = true;
          fct.push([orderB, orderA]);
        }
        if (switch1 || switch2) {
          qin.push([orderA, orderB]);
        }
      }
    }

    this.bets.set(this.activeRace, {qpl, qin, fct, dbl})
  }

  toggleBet = (pool: string, starterA: Starter, starterB: Starter) => {
    if (this.isTrash(starterA)) return;
    if (pool !== 'dbl' && this.isTrash(starterB)) return;
    if (pool === 'dbl' && this.isTrash(starterB, true)) return;

    // @ts-ignore
    let newPairs = [...this.activeBet[pool]] || [];
    const pair = [starterA, starterB].map(s => s.order);

    if (newPairs.some(p => p[0] === pair[0] && p[1] === pair[1])) {
      newPairs = newPairs.filter(p => !(p[0] === pair[0] && p[1] === pair[1]));
    } else {
      newPairs.push(pair);
    }

    let newBets = {...this.activeBet};
    // @ts-ignore
    newBets[pool] = newPairs;

    this.bets.set(this.activeRace, newBets);
  }

  toggleTrash = (starter: Starter, isNextRace: boolean = false) => {
    const card = isNextRace ? this.activeNextRacecard : this.activeRacecard;
    if (isFavorite(starter, card)) return;

    const order = starter.order;
    const race = isNextRace ? this.activeRace + 1 : this.activeRace;
    let unwanted = this.trashes.get(race) || [];

    if (unwanted.includes(order)) unwanted = unwanted.filter(e => e !== order);
    else unwanted.push(order);

    this.trashes.set(race, unwanted);
  }

  adjustOdds = (pool: string, step: number, onMin: boolean, toAdd: boolean) => {
    const field = (onMin ? 'min' : 'max').concat(pool);
    const fieldReverse = (!onMin ? 'min' : 'max').concat(pool);

    // @ts-ignore
    const fieldValue = this.activeRange[field] || 0;
    // @ts-ignore
    const fieldReverseValue = this.activeRange[fieldReverse] || 0;

    if (fieldValue === 0 || fieldReverseValue === 0) return;

    let newFieldValue = fieldValue;
    if (toAdd) {
      if (!onMin) newFieldValue += step;
      else if (fieldValue + step < fieldReverseValue) newFieldValue += step;
    } else {
      if (onMin && fieldValue - step > 0) newFieldValue -= step;
      else if (!onMin && fieldValue - step > fieldReverseValue) newFieldValue -= step;
    }

    let newRange = {...this.activeRange};
    // @ts-ignore
    newRange[field] = newFieldValue;

    this.ranges.set(this.activeRace, newRange);
  }

  isTrash = (starter: Starter, isNextRace: boolean = false): boolean =>
    isNextRace
      ? this.activeNextTrash.includes(starter.order)
      : this.activeTrash.includes(starter.order)

  isShowOdds = (
    pool: string,
    starterA: Starter,
    starterB: Starter,
    isReverse: boolean = false
  ): boolean => {

    if (this.isTrash(starterA)) return false;
    if (pool !== 'dbl' && this.isTrash(starterB)) return false;
    if (pool === 'dbl' && this.isTrash(starterB, true)) return false;

    const qqpInRange = this.isQQPOddsWithinRange(starterA, starterB);
    const fctInRange = this.isFCTOddsWithinRange(starterA, starterB);
    const dblInRange = this.isDBLOddsWithinRange(starterA, starterB);

    const qqpFinal = this.isFinalQQPCombination(starterA, starterB);
    const fctFinal = this.isFinalFCTCombination(starterA, starterB);
    const dblFinal = this.isFinalDBLCombination(starterA, starterB);
    const dblSpecial = this.getDoubleOddsColor(starterA, starterB).length > 0;

    if (pool === 'qin') return qqpInRange[0] || qqpFinal[0];
    if (pool === 'qpl') return qqpInRange[1] || qqpFinal[1];
    if (pool === 'dbl') return dblInRange || dblFinal || dblSpecial;
    if (pool === 'fct') return isReverse
      ? fctInRange[1] || fctFinal
      : fctInRange[0] || fctFinal;

    return true;
  }

  isBothFavorite = (
    starterA: Starter,
    starterB: Starter,
    isNextRace: boolean = false
  ): boolean => {

    if (isNextRace) {
      return isFavorite(starterA, this.activeRacecard)
        && isFavorite(starterB, this.activeNextRacecard)

    } else {
      return starterA.order !== starterB.order
        && isFavorite(starterA, this.activeRacecard)
        && isFavorite(starterB, this.activeRacecard);
    }
  }

  isPeopleConnected = (starterA: Starter, starterB: Starter): boolean => {
    const conn = this.repo.findConnections().find(c =>
      c.meeting === this.activeRacecard.meeting &&
      c.race == this.activeRacecard.race
    );

    if (!conn) return false;

    return conn.connections.some(c =>
      (c.orders[0] == starterA.order && c.orders[1] == starterB.order)
      ||
      (c.orders[0] == starterB.order && c.orders[1] == starterA.order)
    );
  }

  isFinalQQPCombination = (starterA: Starter, starterB: Starter): boolean[] => {
    const placingSum = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard))
      .map(p => [0, 4].includes(p) ? 9 : p)
      .reduce((prev, curr) => prev + curr, 0);
    return [
      placingSum === 3,
      [3, 4, 5].includes(placingSum),
    ];
  }

  isFinalFCTCombination = (starterA: Starter, starterB: Starter): boolean => {
    const placings = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard));
    return placings[0] === 1 && placings[1] === 2;
  }

  isFinalDBLCombination = (starterA: Starter, starterB: Starter): boolean => {
    const placingA = getPlacing(starterA.jockey, this.activeRacecard);
    const placingB = getPlacing(starterB.jockey, this.activeNextRacecard);
    return placingA === 1 && placingB === 1;
  }

  isQQPOddsWithinRange = (starterA: Starter, starterB: Starter): boolean[] => {
    const qqp = this.getStarterQQPOdds(starterA, starterB);
    return [
      qqp[0] >= this.activeRange.minQIN && qqp[0] <= this.activeRange.maxQIN,
      qqp[1] >= this.activeRange.minQPL && qqp[1] <= this.activeRange.maxQPL,
    ];
  }

  isFCTOddsWithinRange = (starterA: Starter, starterB: Starter): boolean[] =>
    this
      .getStarterFCTOdds(starterA, starterB)
      .map(o => o >= this.activeRange.minFCT && o <= this.activeRange.maxFCT);

  isDBLOddsWithinRange = (starterA: Starter, starterB: Starter): boolean => {
    const dbl = this.getStarterDBLOdds(starterA, starterB);
    return dbl >= this.activeRange.minDBL && dbl <= this.activeRange.maxDBL;
  }

  getDBLCellBackground = (currIndex: number, nextIndex: number): string => {
    const currStarters = getStarters(this.activeRacecard).length;
    const nextStarters = getStarters(this.activeNextRacecard).length;

    const currCount = Math.min(5, Math.floor(currStarters / 2));
    const nextCount = Math.min(5, Math.floor(nextStarters / 2));

    const bound = Math.min(currCount, nextCount);
    const boundH = currStarters - Math.min(bound, Math.floor(currStarters / 2));
    const boundV = nextStarters - Math.min(bound, Math.floor(nextStarters / 2));

    if (currIndex + nextIndex === bound - 1) return 'diagonal-reverse-line';
    if (currIndex >= nextIndex + boundH && nextIndex === currIndex - boundH) return 'diagonal-line';
    if (nextIndex >= currIndex + boundV && currIndex === nextIndex - boundV) return 'diagonal-line';
    if (currIndex >= boundH && nextIndex >= boundV) return 'diagonal-reverse-line';

    return '';
  }

  getPairBorder = (pool: string, starterA: Starter, starterB: Starter): string => {
    // @ts-ignore
    const pairs = this.activeBet[pool] || [];
    const pair = [starterA, starterB].map(s => s.order);

    const isSelected = ['fct', 'dbl'].includes(pool)
      // @ts-ignore
      ? pairs.some(p => p[0] === pair[0] && p[1] === pair[1])
      // @ts-ignore
      : pairs.some(p => p.includes(pair[0]) && p.includes(pair[1]));

    return isSelected ? 'border-yellow-400' : 'border-gray-900';
  }

  getSelectedBetCount = (pool: string): number => {
    for (const [key, value] of Object.entries(this.activeBet)) {
      if (key.toLowerCase() === pool.toLowerCase()) return value.length;
    }
    return 0;
  }

  getDBLBankerSignalCount = (banker: Starter, isFirstLeg: boolean): number =>
    getStarters(isFirstLeg ? this.activeNextRacecard : this.activeRacecard)
      .map(leg => this.getCombinationSignals(
          isFirstLeg ? banker : leg,
          isFirstLeg ? leg : banker
        )[3].length
      )
      .reduce((prev, curr) => prev + curr, 0);

  getSingularSignals = (starter: Starter): SingularSignal[][] => {
    const signal = this.activeRacecard?.signal;
    if (!signal) return [[], []];

    return [signal.win, signal.place].map(ss =>
      ss.filter(s => s.order == starter.order)
        .sort((s1, s2) =>
          new Date(s2.detectedAt).getTime() -
          new Date(s1.detectedAt).getTime()
        )
    );
  }

  getCombinationSignals = (starterA: Starter, starterB: Starter): CombinationSignal[][] => {
    const signal = this.activeRacecard?.signal;
    if (!signal) return [[], [], [], []];

    return [
      signal.quinella,
      signal.quinellaPlace,
      signal.forecast,
      signal.double
    ].map((css, index) =>
      css
        .filter(cs =>
          index < 2
            ? cs.orders.includes(starterA.order) && cs.orders.includes(starterB.order)
            : cs.orders[0] == starterA.order && cs.orders[1] == starterB.order
        )
        .sort((cs1, cs2) =>
          new Date(cs2.detectedAt).getTime() -
          new Date(cs1.detectedAt).getTime()
        )
    );
  }

  toSignalTooltip = (signals: SingularSignal[] | CombinationSignal[]): string => {
    if (signals.length === 0) return '';

    const raceTime = new Date(this.activeRacecard.time);
    const changes = signals.map(s => `
      <div class="flex flex-row">
        <div class="w-12 text-red-600">${toRelativeTime(raceTime, s.detectedAt)}</div>
        <div class="w-9">${s.previousOdds}</div>
        <div class="w-5">&#8594;</div>
        <div class="w-9">${s.currentOdds}</div>
        <div class="w-9 text-green-600">
          ${Math.floor(100 * (1 - s.currentOdds / s.previousOdds))}%
        </div>
      </div>
    `).join('');

    return `<div class="w-44 flex flex-col"> ${changes} </div>`;
  }

  getSingularSignalTooltip = (starter: Starter): string =>
    this.toSignalTooltip(
      this.getSingularSignals(starter)
        .reduce((prev, curr) => prev.concat(curr), [])
    )

  getCombinationSignalTooltip = (starterA: Starter, starterB: Starter): string[] =>
    this.getCombinationSignals(starterA, starterB)
      .map(css => this.toSignalTooltip(css))

  getStarterQQPOdds = (starterA: Starter, starterB: Starter): number[] => {
    if (!this.activeRacecard?.odds) return [0, 0];
    const qin = this.activeRacecard.odds?.quinella;
    const qpl = this.activeRacecard.odds?.quinellaPlace;

    return [qin, qpl].map(pairs => {
      if (!pairs) return 0;
      return pairs
        .filter(p => p.orders.includes(starterA.order))
        .filter(p => p.orders.includes(starterB.order))
        .pop()
        ?.odds || 0;
    });
  }

  getStarterFCTOdds = (starterA: Starter, starterB: Starter): number[] => {
    const fct = this.activeRacecard?.odds?.forecast;
    if (!fct) return [0, 0];

    const pairs = fct.filter(comb =>
      comb.orders.includes(starterA.order) &&
      comb.orders.includes(starterB.order)
    );

    if (pairs.length !== 2) return [0, 0];

    return pairs[0].orders[0] === starterA.order
      ? pairs.map(p => p.odds)
      : pairs.reverse().map(p => p.odds);
  }

  getStarterDBLOdds = (starterA: Starter, starterB: Starter): number => {
    const dbl = this.activeRacecard?.odds?.double;
    if (!dbl) return 0;

    return dbl.find(comb =>
      comb.orders[0] == starterA.order &&
      comb.orders[1] == starterB.order
    )
      ?.odds || 0;
  }

  getTrainerColor = (starter: Starter): string => {
    if (getPlacingColor(starter.jockey, this.activeRacecard).length > 0) return '';

    const index = this.trainersWithMoreThanOneStarter.indexOf(starter.trainer);
    return index === -1 ? '' : `italic ${COLORS[index]}`;
  }

  getDoubleOddsColor = (starterA: Starter, starterB: Starter): string => {
    const jockeyA = starterA.jockey;
    const jockeyB = starterB.jockey;
    const trainerA = starterA.trainer;
    const trainerB = starterB.trainer;

    if (this.isFinalDBLCombination(starterA, starterB)) return `text-yellow-400 font-bold`;
    if (jockeyA === jockeyB && trainerA === trainerB) return `text-red-600`;
    if (jockeyA === jockeyB) return `text-green-600`;
    if (trainerA === trainerB) return `text-blue-600`;
    if (starterA.order === starterB.order) return `text-purple-600`;

    return '';
  }

  getHorseNameCH = (horseCode: string): string =>
    this.repo.findHorses().find(h => h.code === horseCode)?.nameCH || horseCode

  get trainersWithMoreThanOneStarter(): string[] {
    return this.activeRacecard?.starters
        .filter(s => !s.scratched)
        .map(s => s.trainer)
        .filter((t, i, a) => a.indexOf(t) !== i)
        .filter((t, i, a) => a.indexOf(t) === i)
      || [];
  }

  get maxMeetingStarterOrder(): number {
    return this.racecards
      .map(r => r.starters)
      .reduce((prev, curr) => prev.concat(curr), [])
      .map(s => s.order)
      .sort((o1, o2) => o1 - o2)
      .pop() || 14;
  }

  get totalSelectedBetCount(): number {
    return Object.values(this.activeBet)
      .map(v => v.length)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get activeBet(): Bet {
    return this.bets.get(this.activeRace) || DEFAULT_BET;
  }

  get activeRange(): OddsRange {
    return this.ranges.get(this.activeRace) || DEFAULT_RANGE;
  }

  get activeTrash(): number[] {
    return this.trashes.get(this.activeRace) || [];
  }

  get activeNextTrash(): number[] {
    return this.trashes.get(this.activeRace + 1) || [];
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get activeNextRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace + 1);
  }

  get maxRace(): number {
    return this.racecards.map(r => r.race).pop() || 0;
  }

  get rangeControls(): RangeControl[] {
    return [
      {
        'pool': 'QPL',
        'step': QPL_ODDS_STEP,
        'minOdds': this.activeRange.minQPL,
        'maxOdds': this.activeRange.maxQPL
      },
      {
        'pool': 'QIN',
        'step': QIN_ODDS_STEP,
        'minOdds': this.activeRange.minQIN,
        'maxOdds': this.activeRange.maxQIN
      },
      {
        'pool': 'FCT',
        'step': FCT_ODDS_STEP,
        'minOdds': this.activeRange.minFCT,
        'maxOdds': this.activeRange.maxFCT
      },
      {
        'pool': 'DBL',
        'step': DBL_ODDS_STEP,
        'minOdds': this.activeRange.minDBL,
        'maxOdds': this.activeRange.maxDBL
      },
    ];
  }

  get copyAsBankersBetTypes(): string[] {
    return ['ALL', 'TRI', 'FF', 'TBM', 'QBM'];
  }

  get multiBankerBetTypes(): string[] {
    return ['ALL', 'FMB', 'TMB', 'QMB'];
  }

  get controlButtonStyle(): string {
    return `px-2 pt-1 pb-1.5 rounded-xl border border-gray-600 ` +
      `hover:border-yellow-400 cursor-pointer`;
  }

  get oddsButtonStyle(): string {
    return `px-4 py-0.5 rounded-xl border border-gray-600 ` +
      `hover:border-yellow-400 cursor-pointer`;
  }

  get isLoading(): boolean {
    return this.racecards.length === 0;
  }
}