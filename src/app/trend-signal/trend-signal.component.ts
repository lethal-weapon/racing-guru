import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Starter} from '../model/starter.model';
import {SignalSnapshot} from '../model/signal.model';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {formatMeeting, toPlacingColor} from '../util/functions';

const BY_STATS = 'By Stats';

@Component({
  selector: 'app-trend-signal',
  templateUrl: './trend-signal.component.html'
})
export class TrendSignalComponent implements OnInit {

  activeBadge: string = BY_STATS;

  protected readonly BY_STATS = BY_STATS;
  protected readonly formatMeeting = formatMeeting;
  protected readonly toPlacingColor = toPlacingColor;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchSignalSnapshots(4, () => {
      this.activeBadge = this.repo.findSignalSnapshots()[0].meeting;
    });
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

      if (this.getBeforePostTimeSignalCount(race, starter.order, 'P') > 0) return false;

      return true;
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
    const match = this.signalSnapshots.find(ss => ss.meeting === this.activeBadge);
    return match ? match : this.signalSnapshots[0];
  }

  get signalSnapshots(): SignalSnapshot[] {
    return this.repo.findSignalSnapshots();
  }

  get isLoading(): boolean {
    return this.repo.findPlayers().length === 0
      || this.repo.findSignalSnapshots().length === 0;
  }
}
