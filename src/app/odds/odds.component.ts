import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {WebsocketService} from '../model/websocket.service';
import {Racecard} from '../model/racecard.model';
import {Starter} from '../model/starter.model';
import {COLORS} from '../util/colors';
import {
  THREE_SECONDS,
  MAX_RACE_PER_MEETING,
  DEFAULT_MIN_QPL_ODDS,
  DEFAULT_MAX_QPL_ODDS,
  DEFAULT_MIN_QIN_ODDS,
  DEFAULT_MAX_QIN_ODDS,
  DEFAULT_MIN_FCT_ODDS,
  DEFAULT_MAX_FCT_ODDS,
  QPL_ODDS_STEP,
  QIN_ODDS_STEP,
  FCT_ODDS_STEP
} from '../util/numbers';
import {
  getMaxRace,
  getPlacing,
  getPlacingColor,
  getRaceBadgeStyle,
  getStarterQWOdds,
  getStarterWinPlaceOdds,
  getStarters,
  isFavorite
} from '../util/functions';

interface OddsRange {
  minQPL: number,
  maxQPL: number,
  minQIN: number,
  maxQIN: number,
  minFCT: number,
  maxFCT: number
}

interface Bet {
  qpl: number[][],
  qin: number[][],
  fct: number[][]
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
  maxFCT: DEFAULT_MAX_FCT_ODDS
}

const DEFAULT_BET: Bet = {
  qpl: [],
  qin: [],
  fct: []
}

@Component({
  selector: 'app-odds',
  templateUrl: './odds.component.html'
})
export class OddsComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;
  hoveredJockey: string = '';

  bets: Map<number, Bet> = new Map();
  ranges: Map<number, OddsRange> = new Map();

  protected readonly isFavorite = isFavorite;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getPlacingColor = getPlacingColor;
  protected readonly getStarters = getStarters;
  protected readonly getStarterQWOdds = getStarterQWOdds;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;

  constructor(
    private socket: WebsocketService,
    private clipboard: Clipboard
  ) {
    socket.racecards.subscribe(data => {
      this.racecards = data;
      this.racecards.sort((r1, r2) => r1.race - r2.race);
    });
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), THREE_SECONDS);
    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.ranges.set(race, {...DEFAULT_RANGE});
      this.bets.set(race, {...DEFAULT_BET});
    }
  }

  resetBets = () =>
    this.bets.set(this.activeRace, {...DEFAULT_BET})

  copyBets = (pool: string = '') => {
    let bets = '';
    for (const [key, value] of Object.entries(this.activeBet)) {
      const cmd = key.startsWith('f') ? 'fs' : key;
      const sep = cmd === 'fs' ? '-' : ',';

      // @ts-ignore
      const poolBets = (value || []).map(c => `${cmd}:${c.join(sep)};`).join(``);

      if (pool === '' || pool.toUpperCase() === key.toUpperCase()) {
        bets = bets.concat(poolBets);
      }
    }
    this.clipboard.copy(bets);
  }

  toggleBet(pool: string, starterA: Starter, starterB: Starter) {
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

  adjustOdds(pool: string, step: number, onMin: boolean, toAdd: boolean) {
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

  isPreferredWQWR(starter: Starter): boolean {
    const wp = getStarterWinPlaceOdds(starter, this.activeRacecard);
    if (wp.win == 0 || wp.place == 0) return false;

    const W = wp.win;
    const QW = getStarterQWOdds(starter, this.activeRacecard)
    if (QW > W) return false;

    return W < 10 && (W - QW <= 1.5)
      ? true
      : Math.abs(1 - W / QW) <= 0.2;
  }

  isFinalQQPCombination(starterA: Starter, starterB: Starter): boolean[] {
    const placingSum = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard))
      .map(p => [0, 4].includes(p) ? 9 : p)
      .reduce((prev, curr) => prev + curr, 0);
    return [
      placingSum === 3,
      [3, 4, 5].includes(placingSum),
    ];
  }

  isFinalFCTCombination(starterA: Starter, starterB: Starter): boolean {
    const placings = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard));
    return placings[0] === 1 && placings[1] === 2;
  }

  isQQPOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
    const qqp = this.getStarterQQPOdds(starterA, starterB);
    return [
      qqp[0] >= this.activeRange.minQIN && qqp[0] <= this.activeRange.maxQIN,
      qqp[1] >= this.activeRange.minQPL && qqp[1] <= this.activeRange.maxQPL,
    ];
  }

  isFCTOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
    return this.getStarterFCTOdds(starterA, starterB)
      .map(o => o >= this.activeRange.minFCT && o <= this.activeRange.maxFCT);
  }

  getPairStyle(pool: string, starterA: Starter, starterB: Starter): string {
    // @ts-ignore
    const pairs = this.activeBet[pool] || [];
    const pair = [starterA, starterB].map(s => s.order);

    // @ts-ignore
    return pairs.some(p => p[0] === pair[0] && p[1] === pair[1])
      ? 'border border-gray-400'
      : 'border border-gray-900';
  }

  getInRangeCombinations(pool: string): number[][] {
    const odds = this.activeRacecard?.odds;
    let combs = odds?.quinellaPlace;
    if (pool === 'QIN') combs = odds?.quinella;
    else if (pool === 'FCT') combs = odds?.forecast;

    if (!combs) return [];

    // @ts-ignore
    const min = this.activeRange[`min${pool}`] || 0;
    // @ts-ignore
    const max = this.activeRange[`max${pool}`] || 0;

    return combs
      .filter(c => c.odds >= min && c.odds <= max)
      .map(c => c.orders);
  }

  getStarterQQPOdds(starterA: Starter, starterB: Starter): number[] {
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

  getStarterFCTOdds(starterA: Starter, starterB: Starter): number[] {
    const fct = this.activeRacecard?.odds?.forecast;
    if (!fct) return [0, 0];

    const pairs = fct.filter(comb =>
      comb.orders.includes(starterA.order) &&
      comb.orders.includes(starterB.order)
    )

    if (pairs.length !== 2) return [0, 0];
    if (pairs[0].orders[0] === starterA.order) return pairs.map(p => p.odds);
    return pairs.reverse().map(p => p.odds);
  }

  getQQPCellColor(starterA: Starter, starterB: Starter): string {
    if (starterA.order === starterB.order) return ``;
    const isBothFavorite =
      isFavorite(starterA, this.activeRacecard) &&
      isFavorite(starterB, this.activeRacecard)

    return isBothFavorite ? `bg-gray-600` : ``;
  }

  getTrainerColor(starter: Starter): string {
    if (getPlacingColor(starter.jockey, this.activeRacecard).length > 0) return '';

    const index = this.trainersWithMoreThanOneStarter.indexOf(starter.trainer);
    return index === -1 ? '' : `italic ${COLORS[index]}`;
  }

  get trainersWithMoreThanOneStarter(): string[] {
    return this.activeRacecard?.starters
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

  get selectedBetCount(): number {
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

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
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
    ];
  }

  get buttonStyle(): string {
    return `px-4 py-0.5 rounded-xl border border-gray-600 ` +
      `hover:border-yellow-400 cursor-pointer`;
  }
}