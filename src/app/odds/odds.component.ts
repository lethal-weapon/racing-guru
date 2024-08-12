import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {WebsocketService} from '../websocket.service';
import {RestRepository} from '../model/rest.repository';
import {DEFAULT_PICK, Pick, Selection} from '../model/pick.model';
import {DEFAULT_RECOMMENDATION, RaceRecommendation, Recommendation} from '../model/recommendation.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {CombinationSignal, SingularSignal} from '../model/signal.model';
import {COLORS} from '../util/strings';
import {
  DBL_ODDS_STEP,
  DEFAULT_MAX_DBL_ODDS,
  DEFAULT_MAX_FCT_ODDS,
  DEFAULT_MAX_QIN_ODDS,
  DEFAULT_MAX_QPL_ODDS,
  DEFAULT_MIN_DBL_ODDS,
  DEFAULT_MIN_FCT_ODDS,
  DEFAULT_MIN_QIN_ODDS,
  DEFAULT_MIN_QPL_ODDS,
  FCT_ODDS_STEP,
  MAX_RACE_PER_MEETING,
  QIN_ODDS_STEP,
  QPL_ODDS_STEP,
} from '../util/numbers';
import {
  formatOdds,
  getMaxRace,
  getRaceBadgeStyle,
  getSignalColor,
  getStarterQQPWinPlaceOdds,
  getStarters,
  getStarterWinPlaceOdds,
  toPlacingColor,
  toRelativeTime
} from '../util/functions';

interface OddsRange {
  minQPL: number,
  maxQPL: number,
  minQIN: number,
  maxQIN: number,
  minFCT: number,
  maxFCT: number,
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
  pick: Pick = DEFAULT_PICK;
  recommendation: Recommendation = DEFAULT_RECOMMENDATION;
  racecards: Racecard[] = [];

  activeRace: number = 1;
  trackModeOn: boolean = false;
  onDoubleTable: boolean = false;
  hoveredJockey: string = '';

  bets: Map<number, Bet> = new Map();
  ranges: Map<number, OddsRange> = new Map();
  trashes: Map<number, number[]> = new Map();

  protected readonly toPlacingColor = toPlacingColor;
  protected readonly getSignalColor = getSignalColor;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getStarters = getStarters;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;
  protected readonly getStarterQQPWinPlaceOdds = getStarterQQPWinPlaceOdds;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService,
    private clipboard: Clipboard
  ) {
    socket.addPickCallback((newPick: Pick) => {
      if (this.pick != newPick) this.pick = newPick;
      if (this.trackModeOn) this.track();
    });

    socket.addRecommendationCallback((newRecommendation: Recommendation) => {
      if (this.recommendation != newRecommendation) this.recommendation = newRecommendation;
    });

    socket.addRacecardCallback((newCard: Racecard) => {
      const oldCard = this.racecards
        .find(r => r.meeting === newCard.meeting && r.race === newCard.race);

      if (oldCard) {
        if (oldCard.time != newCard.time) oldCard.time = newCard.time;
        if (oldCard.starters != newCard.starters) oldCard.starters = newCard.starters;
        if (oldCard.changes != newCard.changes) oldCard.changes = newCard.changes;
        if (oldCard.pool != newCard.pool) oldCard.pool = newCard.pool;
        if (oldCard.odds != newCard.odds) oldCard.odds = newCard.odds;
        if (oldCard.signal != newCard.signal) oldCard.signal = newCard.signal;
        if (oldCard.dividend != newCard.dividend) oldCard.dividend = newCard.dividend;
      }

      if (this.trackModeOn) this.track();
    });
  }

  ngOnInit(): void {
    this.repo.fetchPick(() => {
      this.pick = this.repo.findPick();
    });

    this.repo.fetchRacecards('latest', () => {
      this.racecards = this.repo.findRacecards();
    });

    this.repo.fetchRecommendations(1, () => {
      this.recommendation =
        this.repo.findRecommendations()[0] || DEFAULT_RECOMMENDATION;
    });

    this.repo.fetchMeetingHorses();
    this.repo.fetchBlacklistConnections();

    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.bets.set(race, {...DEFAULT_BET});
      this.ranges.set(race, {...DEFAULT_RANGE});
      this.trashes.set(race, []);
    }
  }

  resetBets = () =>
    this.bets.set(this.activeRace, {...DEFAULT_BET})

  resetFavorites = () => {
    let newPick: Pick = {...this.pick, races: [...this.pick.races]};
    let newRacePick = newPick.races.find(r => r.race === this.activeRace);
    if (!newRacePick) return;

    newRacePick.favorites = [];
    this.repo.savePick(newPick);
  }

  resetSelections = () => {
    let newPick: Pick = {...this.pick, races: [...this.pick.races]};
    let newRacePick = newPick.races.find(r => r.race === this.activeRace);
    if (!newRacePick) return;

    newRacePick.selections = [];
    this.repo.savePick(newPick);
  }

  copyRecommendationBets = (isCopyAll: boolean, betline: string) => {
    if (isCopyAll) {
      const betlines = this.activeRecommendation.bets.map(b => b.betline).join(';');
      this.clipboard.copy(betlines);
    } else {
      this.clipboard.copy(betline);
    }
  }

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

  copyMultiBankerBets = (betType: string) => {
    const ordersByPlacing = Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(p =>
        this.activeSelections
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
      .map((_, index) => 1 + index)
      .map(p =>
        this.activeSelections
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

  track = () => {
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
    if (this.isFavorite(starter, card)) return;

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
      return this.isFavorite(starterA, this.activeRacecard)
        && this.isFavorite(starterB, this.activeNextRacecard)

    } else {
      return starterA.order !== starterB.order
        && this.isFavorite(starterA, this.activeRacecard)
        && this.isFavorite(starterB, this.activeRacecard);
    }
  }

  isPeopleConnected = (starterA: Starter, starterB: Starter): boolean => {
    const blacklist = this.repo.findBlacklistConnections().find(c =>
      c.meeting === this.activeRacecard.meeting &&
      c.race == this.activeRacecard.race
    );

    if (!blacklist) return true;

    return !blacklist.orders.some(c =>
      (c[0] == starterA.order && c[1] == starterB.order)
      ||
      (c[0] == starterB.order && c[1] == starterA.order)
    );
  }

  isFinalQQPCombination = (starterA: Starter, starterB: Starter): boolean[] => {
    const placingSum = [starterA, starterB]
      .map(s => s?.placing || 0)
      .map(p => [0, 4].includes(p) ? 9 : p)
      .reduce((prev, curr) => prev + curr, 0);
    return [
      placingSum === 3,
      [3, 4, 5].includes(placingSum),
    ];
  }

  isFinalFCTCombination = (starterA: Starter, starterB: Starter): boolean => {
    const placings = [starterA, starterB].map(s => s?.placing || 0);
    return placings[0] === 1 && placings[1] === 2;
  }

  isFinalDBLCombination = (starterA: Starter, starterB: Starter): boolean => {
    const placingA = starterA?.placing || 0;
    const placingB = starterB?.placing || 0;
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
      signal.doubles
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
        <div class="w-9">${formatOdds(s.previousOdds)}</div>
        <div class="w-5">&#8594;</div>
        <div class="w-9">${formatOdds(s.currentOdds)}</div>
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
    const dbl = this.activeRacecard?.odds?.doubles;
    if (!dbl) return 0;

    return dbl.find(comb =>
      comb.orders[0] == starterA.order &&
      comb.orders[1] == starterB.order
    )
      ?.odds || 0;
  }

  getTrainerColor = (starter: Starter): string => {
    if (toPlacingColor(starter?.placing).length > 0) return '';

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

  isFavorite = (starter: Starter, racecard: Racecard): boolean =>
    this.pick.races
      .filter(r => r.race === racecard.race)
      .some(r => r.favorites.includes(starter.order))

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

  get activeSelections(): Selection[] {
    return this.pick.races.find(r => r.race === this.activeRace)?.selections || [];
  }

  get activeRecommendationCombinations(): number {
    return this.activeRecommendation.bets
      .map(b => b.combinations)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get activeRecommendationTime(): string {
    const raceTime = new Date(this.activeRacecard.time);
    return toRelativeTime(raceTime, this.activeRecommendation.computedAt);
  }

  get activeRecommendation(): RaceRecommendation {
    // @ts-ignore
    return this.recommendation.races.find(r => r.race === this.activeRace);
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
    return this.pick.races.length === 0
      || this.recommendation.races.length === 0
      || this.racecards.length === 0
      || this.repo.findHorses().length === 0
      || this.repo.findBlacklistConnections().length === 0;
  }
}
