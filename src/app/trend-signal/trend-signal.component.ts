import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {SignalSnapshot} from '../model/signal.model';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {formatMeeting, getOddsIntensityColor, getWinPlaceOdds, toPlacingColor} from '../util/functions';

const BY_STATS = 'By Stats';

interface WinningSignal {
  pool: string,
  combination: string,
  signalCount: number
}

@Component({
  selector: 'app-trend-signal',
  templateUrl: './trend-signal.component.html'
})
export class TrendSignalComponent implements OnInit {

  activeBadge: string = BY_STATS;

  protected readonly BY_STATS = BY_STATS;
  protected readonly formatMeeting = formatMeeting;
  protected readonly toPlacingColor = toPlacingColor;
  protected readonly getOddsIntensityColor = getOddsIntensityColor;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchSignalSnapshots(6, () => {
    });
  }

  getTop4Finishers = (race: number): Starter[] => {
    const raceSnapshot = this.activeSnapshot.races.find(s => s.race === race);
    if (!raceSnapshot) return [];

    return raceSnapshot.starters
      .filter(s => ((s?.placing || 0) >= 1) && ((s?.placing || 0) <= 4))
      .sort((s1, s2) => s1.placing - s2.placing);
  }

  getWinningSignals = (race: number, sliceCount: number): WinningSignal[] => {
    const raceSnapshot = this.activeSnapshot.races.find(s => s.race === race);
    if (!raceSnapshot) return [];

    const starters = this.getTop4Finishers(race);
    if (starters.length < 2) return [];

    const Qcomb = starters.slice(0, 2).map(s => s.order);
    const Qcount = (raceSnapshot?.signal?.quinella || [])
      .filter(ss => ss.detectedAt < raceSnapshot.time)
      .filter(ss => Qcomb.every(o => ss.orders.includes(o)))
      .length;
    const FCTcount = (raceSnapshot?.signal?.forecast || [])
      .filter(ss => ss.detectedAt < raceSnapshot.time)
      .filter(ss => ss.orders === Qcomb)
      .length;

    let signals = [
      {pool: 'Q', combination: Qcomb.join(', '), signalCount: Qcount},
      {pool: 'FCT', combination: Qcomb.join('-'), signalCount: FCTcount},
    ];

    if (starters.length < 3 && sliceCount === 1) return signals;
    if (starters.length < 3) return [];

    const TRIcomb = starters.slice(0, 3).map(s => s.order);
    const TRIcount = (raceSnapshot?.signal?.trio || [])
      .filter(ss => ss.detectedAt < raceSnapshot.time)
      .filter(ss => TRIcomb.every(o => ss.orders.includes(o)))
      .length;

    const QPcombs = [
      [starters[0].order, starters[1].order],
      [starters[0].order, starters[2].order],
      [starters[1].order, starters[2].order],
    ];
    const QPsignals = QPcombs.map((qpc, index) => ({
      pool: `QP-${index + 1}`,
      combination: qpc.join(', '),
      signalCount: (raceSnapshot?.signal?.quinellaPlace || [])
        .filter(ss => ss.detectedAt < raceSnapshot.time)
        .filter(ss => qpc.every(o => ss.orders.includes(o)))
        .length
    }));

    signals.push({pool: 'TRI', combination: TRIcomb.join(', '), signalCount: TRIcount})

    if (sliceCount === 1) return signals;
    if (sliceCount === 2) return QPsignals;

    if (starters.length < 4) return [];
    const FFcomb = starters.slice(0, 4).map(s => s.order);
    const FFcount = (raceSnapshot?.signal?.firstFour || [])
      .filter(ss => ss.detectedAt < raceSnapshot.time)
      .filter(ss => FFcomb.every(o => ss.orders.includes(o)))
      .length;

    let DBL1comb: number[] = [];
    let DBL1count = 0;

    let DBL2comb: number[] = [];
    let DBL2count = 0;

    if (race > 1) {
      const prevStarters = this.getTop4Finishers(race - 1);
      if (prevStarters.length > 0) {
        DBL1comb = [prevStarters[0].order, starters[0].order];
        DBL2comb = [prevStarters[0].order, starters[1].order];

        const prevRaceSnapshot = this.activeSnapshot.races.find(s => s.race === race - 1);
        if (prevRaceSnapshot) {
          DBL1count = (prevRaceSnapshot?.signal?.doubles || [])
            .filter(ss => ss.detectedAt < prevRaceSnapshot.time)
            .filter(ss => ss.orders === DBL1comb)
            .length;

          DBL2count = (prevRaceSnapshot?.signal?.doubles || [])
            .filter(ss => ss.detectedAt < prevRaceSnapshot.time)
            .filter(ss => ss.orders === DBL2comb)
            .length;
        }
      }
    }

    return [
      {pool: 'DBL-1', combination: DBL1comb.join('/'), signalCount: DBL1count},
      {pool: 'DBL-2', combination: DBL2comb.join('/'), signalCount: DBL2count},
      {pool: 'FF', combination: FFcomb.join(', '), signalCount: FFcount}
    ];
  }

  isTop4WithMostSignalBeforePostTime =
    (race: number, starter: Starter): boolean => {

      const raceSnapshot = this.activeSnapshot.races.find(s => s.race === race);
      if (!raceSnapshot) return false;

      return raceSnapshot.starters
        .map(s => this.getTotalBeforePostTimeSignalCount(race, s.order))
        .filter((r, index, arr) => index === arr.indexOf(r))
        .filter(c => c > 0)
        .sort((c1, c2) => c2 - c1)
        .slice(0, 4)
        .includes(this.getTotalBeforePostTimeSignalCount(race, starter.order));
    }

  isTop4WithNoWinPlaceSignalBeforePostTime =
    (race: number, starter: Starter): boolean => {

      if (toPlacingColor(starter?.placing).length === 0) return false;

      if (this.getBeforePostTimeSignalCount(race, starter.order, 'W') > 0) return false;

      return this.getBeforePostTimeSignalCount(race, starter.order, 'P') <= 0;
    }

  getTotalBeforePostTimeSignalCount = (race: number, order: number): number =>
    this.pools
      .map(p => this.getBeforePostTimeSignalCount(race, order, p))
      .reduce((prev, curr) => prev + curr, 0)

  getBeforePostTimeSignalCount =
    (race: number, order: number, pool: string): number => {

      const raceSnapshot = this.activeSnapshot.races.find(s => s.race === race);
      if (!raceSnapshot) return 0;

      if (['W', 'P'].includes(pool)) {
        return (
          pool === 'W'
            ? raceSnapshot?.signal?.win || []
            : raceSnapshot?.signal?.place || []
        )
          .filter(ss => ss.order === order && ss.detectedAt < raceSnapshot.time)
          .length;
      }

      if (['Q', 'QP', 'FCT'].includes(pool)) {
        return (
          pool === 'Q'
            ? raceSnapshot?.signal?.quinella || []
            : (
              pool === 'QP'
                ? raceSnapshot?.signal?.quinellaPlace || []
                : raceSnapshot?.signal?.forecast || []
            )
        )
          .filter(ss => ss.orders.includes(order) && ss.detectedAt < raceSnapshot.time)
          .length;
      }

      if (['TRI', 'FF'].includes(pool)) {
        return (
          pool === 'TRI'
            ? raceSnapshot?.signal?.trio || []
            : raceSnapshot?.signal?.firstFour || []
        )
          .filter(ss => ss.orders.includes(order) && ss.detectedAt < raceSnapshot.time)
          .length;
      }

      if (pool === 'DBL') {
        return (raceSnapshot?.signal?.doubles || [])
          .filter(ss => ss.orders[0] === order && ss.detectedAt < raceSnapshot.time)
          .length;
      }

      return 0;
    }

  getStarterWinOdds = (race: number, starter: Starter): number => {
    if ((starter?.winOdds || 0) > 0) return starter.winOdds;

    if (this.activeSnapshot.meeting === this.racecards[0].meeting) {
      const card = this.racecards.find(r => r.race === race);
      if (card) {
        return getWinPlaceOdds(starter.jockey, card).win;
      }
    }

    return 0;
  }

  getRaceStarters = (race: number): Starter[] =>
    (
      this.activeSnapshot.races
        .find(s => s.race === race)
        ?.starters || []
    )
      .sort((s1, s2) => s1.order - s2.order)

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  get borderedPools(): string[] {
    return ['W', 'P'];
  }

  get pools(): string[] {
    return ['W', 'P', 'Q', 'QP', 'FCT', 'TRI', 'FF'];
  }

  get maxRace(): number {
    return this.activeSnapshot.races
      .map(s => s.race)
      .sort((r1, r2) => r1 - r2)
      .pop() || MAX_RACE_PER_MEETING;
  }

  get activeSnapshot(): SignalSnapshot {
    if (this.activeBadge === this.racecards[0].meeting) {
      return {
        meeting: this.racecards[0].meeting,
        venue: this.racecards[0].venue,
        races: this.racecards.map(r => ({
          race: r.race,
          time: r.time,
          signal: r.signal,
          starters: [...r.starters],
        }))
      };
    }

    const match = this.signalSnapshots.find(ss => ss.meeting === this.activeBadge);
    return match ? match : this.signalSnapshots[0];
  }

  get signalSnapshots(): SignalSnapshot[] {
    return this.repo.findSignalSnapshots();
  }

  get racecards(): Racecard[] {
    return this.repo.findRacecards();
  }

  get isLoading(): boolean {
    return this.repo.findPlayers().length === 0
      || this.repo.findSignalSnapshots().length === 0
      || this.repo.findRacecards().length === 0;
  }
}
