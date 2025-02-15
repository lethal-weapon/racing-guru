import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {WebsocketService} from '../websocket.service';
import {RestRepository} from '../model/rest.repository';
import {DEFAULT_PICK, Pick} from '../model/pick.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {CombinationSignal, SingularSignal} from '../model/signal.model';
import {OddsSnapshot, StarterCashflow} from '../model/oddsSnapshot.model';
import {COLORS, LATEST} from '../util/strings';
import {
  CAPITAL_STEP,
  DBL_ODDS_STEP,
  DEFAULT_CAPITAL,
  DEFAULT_MAX_DBL_ODDS,
  DEFAULT_MAX_FCT_ODDS,
  DEFAULT_MAX_QIN_ODDS,
  DEFAULT_MAX_QPL_ODDS,
  DEFAULT_MIN_DBL_ODDS,
  DEFAULT_MIN_FCT_ODDS,
  DEFAULT_MIN_QIN_ODDS,
  DEFAULT_MIN_QPL_ODDS,
  DEFAULT_UNIT_BET,
  FCT_ODDS_STEP,
  MAX_RACE_PER_MEETING,
  ONE_MILLION,
  QIN_ODDS_STEP,
  QPL_ODDS_STEP,
  UNIT_BET_STEP
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

interface ArbitrageBet {
  minTotalDebit: number,
  expectedRoi: number,
  betline: string
}

@Component({
  selector: 'app-odds',
  templateUrl: './odds.component.html'
})
export class OddsComponent implements OnInit {
  pick: Pick = DEFAULT_PICK;
  racecards: Racecard[] = [];
  oddsSnapshots: OddsSnapshot[] = [];

  activeRace: number = 1;
  trackModeOn: boolean = false;
  onDoubleTable: boolean = false;
  isTrueDutching: boolean = false;
  hoveredJockey: string = '';
  cashflowMinute: number = -3;

  bets: Map<number, Bet> = new Map();
  ranges: Map<number, OddsRange> = new Map();
  unitBets: Map<number, number> = new Map();
  capitals: Map<number, number> = new Map();

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

    socket.addOddsSnapshotCallback((newSnapshot: OddsSnapshot) => {
      const oldSnapshot = this.oddsSnapshots
        .find(s => s.meeting === newSnapshot.meeting && s.race === newSnapshot.race);

      if (oldSnapshot) {
        if (oldSnapshot.time != newSnapshot.time) oldSnapshot.time = newSnapshot.time;
        if (oldSnapshot.distributions != newSnapshot.distributions) oldSnapshot.distributions = newSnapshot.distributions;
        if (oldSnapshot.cashflows != newSnapshot.cashflows) oldSnapshot.cashflows = newSnapshot.cashflows;
      }

      if (this.trackModeOn) this.track();
    });
  }

  ngOnInit(): void {
    const meeting = LATEST;

    this.repo.fetchPick(meeting, () => {
      this.pick = this.repo.findPick();
    });

    this.repo.fetchRacecards(meeting, () => {
      this.racecards = this.repo.findRacecards();
    });

    this.repo.fetchOddsSnapshots(meeting, () => {
      this.oddsSnapshots = this.repo.findOddsSnapshots();
    });

    this.repo.fetchMeetingHorses(meeting);

    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.bets.set(race, {...DEFAULT_BET});
      this.ranges.set(race, {...DEFAULT_RANGE});
      this.unitBets.set(race, DEFAULT_UNIT_BET);
      this.capitals.set(race, DEFAULT_CAPITAL);
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

  copyBets = (pool: string = '') => {
    const betline = pool.length > 0
      ? this.getArbitrageBet(pool).betline
      : this.rangeControls
        .map(rc => this.getArbitrageBet(rc.pool).betline)
        .filter(b => b.length > 0)
        .join(';');

    this.clipboard.copy(betline);
  }

  getBetlines = (pool: string = ''): string[] => {
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
    return bets.split(';').filter(b => b.length > 0);
  }

  getArbitrageBet = (pool: string): ArbitrageBet => {
    const betlines = this.getBetlines(pool).map(betline => {
      let odds = 1;
      let orders = betline
        .split(':')[1]
        .replace('-', ',')
        .replace('/', ',')
        .split(',')
        .map(o => parseInt(o));

      if (pool === 'QIN') odds = this.getStarterQQPOdds(orders[0], orders[1])[0];
      if (pool === 'QPL') odds = this.getStarterQQPOdds(orders[0], orders[1])[1];
      if (pool === 'DBL') odds = this.getStarterDBLOdds(orders[0], orders[1]);
      if (pool === 'FCT') {
        const fct1 = this.getStarterFCTOdds(orders[0], orders[1])[0];
        const fct2 = this.getStarterFCTOdds(orders[0], orders[1])[1];
        if (fct1 > 0) odds = fct1;
        else if (fct2 > 0) odds = fct2;
      }

      return {betline: betline, odds: odds < 1 ? 1 : odds};
    });

    if (betlines.length === 0) return {minTotalDebit: 0, expectedRoi: 0, betline: ''};
    if (betlines.length === 1) {
      return {
        minTotalDebit: this.activeUnitBet,
        expectedRoi: betlines[0].odds - 1,
        betline: betlines[0].betline,
      };
    }

    const minEachCredit =
      this.activeUnitBet * (betlines.sort((b1, b2) => b2.odds - b1.odds)[0].odds || 1);

    const oddsWagerList = betlines.map(b => {
      let wager = Math.floor(minEachCredit / b.odds);
      while (wager % this.activeUnitBet !== 0) wager++;
      return {...b, wager: wager};
    });

    const minTotalDebit = oddsWagerList
      .map(ow => ow.wager)
      .reduce((prev, curr) => prev + curr, 0);

    const roiSum = oddsWagerList
      .map(ow => ow.wager * ow.odds / minTotalDebit - 1)
      .reduce((prev, curr) => prev + curr, 0);

    const totalBetline = oddsWagerList
      .map(ow => {
        if (!this.isTrueDutching) return `${ow.betline}/$${ow.wager}`;

        const multiplier = ow.wager / this.activeUnitBet;
        return `${ow.betline}/$${this.activeUnitBet};`
          .repeat(multiplier)
          .split(';')
          .filter(b => b.length > 0)
          .join(';');
      })
      .join(';');

    return {
      minTotalDebit: minTotalDebit,
      expectedRoi: roiSum / oddsWagerList.length,
      betline: totalBetline
    };
  }

  track = () => {
  }

  toggleBet = (pool: string, starterA: Starter, starterB: Starter) => {
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

  adjustCashflowMinute = (increment: number) => {
    if (increment === -99) {
      this.cashflowMinute = -3;

    } else if (increment === -1) {
      if (this.cashflowMinute > -3) this.cashflowMinute -= 1;

    } else if (increment === 1) {
      if (this.cashflowMinute < 25) this.cashflowMinute += 1;

    } else if (increment === 99) {
      this.cashflowMinute = 25;
    }
  }

  adjustCapital = (toAdd: boolean) => {
    const currentAmount = this.capitals.get(this.activeRace) || DEFAULT_CAPITAL;
    if (toAdd) {
      this.capitals.set(this.activeRace, currentAmount + CAPITAL_STEP);
    } else {
      if (currentAmount > CAPITAL_STEP) {
        this.capitals.set(this.activeRace, currentAmount - CAPITAL_STEP);
      }
    }
  }

  adjustUnitBet = (toAdd: boolean) => {
    const currentAmount = this.unitBets.get(this.activeRace) || DEFAULT_UNIT_BET;
    if (toAdd) {
      this.unitBets.set(this.activeRace, currentAmount + UNIT_BET_STEP);
    } else {
      if (currentAmount > UNIT_BET_STEP) {
        this.unitBets.set(this.activeRace, currentAmount - UNIT_BET_STEP);
      }
    }
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

  isShowOdds = (
    pool: string,
    starterA: Starter,
    starterB: Starter,
    isReverse: boolean = false
  ): boolean => {

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
    const qqp = this.getStarterQQPOdds(starterA.order, starterB.order);
    return [
      qqp[0] >= this.activeRange.minQIN && qqp[0] <= this.activeRange.maxQIN,
      qqp[1] >= this.activeRange.minQPL && qqp[1] <= this.activeRange.maxQPL,
    ];
  }

  isFCTOddsWithinRange = (starterA: Starter, starterB: Starter): boolean[] =>
    this
      .getStarterFCTOdds(starterA.order, starterB.order)
      .map(o => o >= this.activeRange.minFCT && o <= this.activeRange.maxFCT)

  isDBLOddsWithinRange = (starterA: Starter, starterB: Starter): boolean => {
    const dbl = this.getStarterDBLOdds(starterA.order, starterB.order);
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
      .reduce((prev, curr) => prev + curr, 0)

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
      this
        .getSingularSignals(starter)
        .reduce((prev, curr) => prev.concat(curr), [])
    )

  getCombinationSignalTooltip = (starterA: Starter, starterB: Starter): string[] =>
    this
      .getCombinationSignals(starterA, starterB)
      .map(css => this.toSignalTooltip(css))

  getStarterQQPOdds = (starterA: number, starterB: number): number[] => {
    if (!this.activeRacecard?.odds) return [0, 0];
    const qin = this.activeRacecard.odds?.quinella;
    const qpl = this.activeRacecard.odds?.quinellaPlace;

    return [qin, qpl].map(pairs => {
      if (!pairs) return 0;
      return pairs
        .filter(p => p.orders.includes(starterA))
        .filter(p => p.orders.includes(starterB))
        .pop()
        ?.odds || 0;
    });
  }

  getStarterFCTOdds = (starterA: number, starterB: number): number[] => {
    const fct = this.activeRacecard?.odds?.forecast;
    if (!fct) return [0, 0];

    const pairs = fct.filter(comb =>
      comb.orders.includes(starterA) &&
      comb.orders.includes(starterB)
    );

    if (pairs.length !== 2) return [0, 0];

    return pairs[0].orders[0] === starterA
      ? pairs.map(p => p.odds)
      : pairs.reverse().map(p => p.odds);
  }

  getStarterDBLOdds = (starterA: number, starterB: number): number => {
    const dbl = this.activeRacecard?.odds?.doubles;
    if (!dbl) return 0;

    return dbl.find(comb =>
      comb.orders[0] == starterA &&
      comb.orders[1] == starterB
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

  isAbnormalCashflow = (starter: Starter): boolean => {
    const starters = getStarters(this.activeRacecard);
    const priorStarterIndex = starters.indexOf(starter) - 1;
    if (priorStarterIndex < 0) return false;

    const starterCashflow = this.getStarterCashflow(starter).height;
    const priorStarterCashflow = this.getStarterCashflow(starters[priorStarterIndex]).height;
    return starterCashflow > priorStarterCashflow;
  }

  getStarterCashflow = (starter: Starter): { height: number, amount: string } => {
    const cashflows = this.activeRacecard.starters
      .filter(s => !s.scratched)
      .map(s =>
        ({
          order: s.order,
          cashflow: this.activeCashflows
            .flatMap(cf => cf.investments)
            .filter(i => i.order === s.order)
            .map(i => i.total)
            .reduce((prev, curr) => prev + curr, 0)
        }))
      .sort((a, b) => b.cashflow - a.cashflow);

    if (cashflows.some(cf => cf.cashflow < 1)) return {height: 0, amount: ''};

    const maxCashflow = cashflows[0]?.cashflow;
    const starterCashflow = cashflows.find(cf => cf.order === starter.order)?.cashflow || 0;

    return {
      height: parseFloat((96.0 * starterCashflow / maxCashflow).toFixed(1)),
      amount: `${(starterCashflow / ONE_MILLION).toFixed(2)}M`
    };
  }

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
      .flatMap(r => r.starters)
      .map(s => s.order)
      .sort((o1, o2) => o1 - o2)
      .pop() || 14;
  }

  get totalSelectedBetCount(): number {
    return Object.values(this.activeBet)
      .map(v => v.length)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get cashflowMinuteDisplay(): string {
    if (this.cashflowMinute === -3) return `Latest`;
    return `${this.cashflowMinute} Min`.replace('-', '+');
  }

  get activeBet(): Bet {
    return this.bets.get(this.activeRace) || DEFAULT_BET;
  }

  get activeRange(): OddsRange {
    return this.ranges.get(this.activeRace) || DEFAULT_RANGE;
  }

  get activeUnitBet(): number {
    return this.unitBets.get(this.activeRace) || DEFAULT_UNIT_BET;
  }

  get activeCapital(): number {
    return this.capitals.get(this.activeRace) || DEFAULT_CAPITAL;
  }

  get activeCashflows(): StarterCashflow[] {
    const raceTime = new Date(this.activeRacecard.time).getTime();
    let upToTimestamp = raceTime - 60_000 * this.cashflowMinute;

    return (this.oddsSnapshots.find(r => r.race === this.activeRace)?.cashflows || [])
      .filter(cf => new Date(cf.toTimestamp).getTime() <= upToTimestamp);
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
      || this.racecards.length === 0
      || this.oddsSnapshots.length === 0
      || this.repo.findHorses().length === 0;
  }
}
