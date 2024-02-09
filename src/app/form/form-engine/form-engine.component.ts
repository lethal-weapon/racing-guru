import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {
  DEFAULT_NEGATIVE_PERFORMANCE_STARTER,
  NegativePerformanceStarter,
  SeasonPerformance
} from '../../model/performance.model';
import {PLACING_MAPS} from '../../util/strings';
import {MAX_RACE_PER_MEETING, ONE_MINUTE} from '../../util/numbers';
import {formatOdds} from '../../util/functions';

@Component({
  selector: 'app-form-engine',
  templateUrl: './form-engine.component.html'
})
export class FormEngineComponent implements OnInit {
  isPositivePerformance: boolean = true;

  protected readonly formatOdds = formatOdds;
  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchEnginePerformance();
    this.repo.fetchNegativeEnginePerformance();

    setInterval(() => {
      this.repo.fetchEnginePerformance();
      this.repo.fetchNegativeEnginePerformance();
    }, ONE_MINUTE);
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  formatPlacing = (placing: string): string => {
    switch (placing) {
      case 'W':
        return 'WIN (1/3)';
      case 'Q':
        return 'QIN (2/4)';
      case 'P':
        return 'TCE (3/5)';
      case 'F':
        return 'QTT (4/6)';
      default:
        return '?';
    }
  }

  isBoundaryMeeting = (meeting: string): boolean =>
    this.meetings
      .map(m => m.slice(0, 7))
      .filter((prefix, i, array) => array.indexOf(prefix) === i)
      .map(prefix => this.meetings
        .filter(m => m.startsWith(prefix))
        .sort((m1, m2) => m1.localeCompare(m2))
        .shift()
      )
      .includes(meeting);

  getNegativePerformanceOdds = (reversedRank: number, meeting: string, race: number): number =>
    this.getNegativePerformanceStarter(reversedRank, meeting, race).winOdds

  getNegativePerformanceStarter =
    (reversedRank: number, meeting: string, race: number): NegativePerformanceStarter =>
      this.repo.findNegativeEnginePerformances()
        .find(p => p.meeting === meeting && p.race === race)
        ?.starters
        .find(s => s.reversedRank === reversedRank)
      || DEFAULT_NEGATIVE_PERFORMANCE_STARTER

  getHitRaceOdds = (topn: number, meeting: string, race: number): number =>
    this.performances
      .flatMap(p => p.hits)
      .filter(h => h.topn === topn)
      .flatMap(h => h.races)
      .filter(hr => hr.meeting === meeting && hr.race === race)
      .map(hr => hr.odds)
      .reduce((prev, curr) => prev + curr, 0)

  get currentSeasonProgress(): string {
    return `${Math.ceil(100 * this.meetings.length / 88)}%`;
  }

  get meetings(): string[] {
    return this.performances
      .flatMap(p => p.hits)
      .flatMap(h => h.races)
      .map(hr => hr.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get performances(): SeasonPerformance[] {
    return this.repo.findEnginePerformances();
  }
}