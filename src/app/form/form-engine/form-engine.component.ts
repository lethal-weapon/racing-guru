import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {PLACING_MAPS, SEASONS} from '../../util/strings';
import {MAX_RACE_PER_MEETING, ONE_MINUTE} from '../../util/numbers';
import {formatOdds} from '../../util/functions';
import {
  DEFAULT_NEGATIVE_PERFORMANCE_STARTER,
  NegativePerformance,
  NegativePerformanceStarter,
  SeasonPerformance
} from '../../model/performance.model';

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

  getNegativePerformanceByPlacing = (period: string): Array<{ races: number, hits: number }> => {
    const performances = this.getNegativePerformances(period);

    const npByPlacings = PLACING_MAPS.map((_, index) => ({
      races: performances.length,
      hits: performances.filter(p =>
        p.starters.some(s => s.placing == index + 1)).length
    }));

    return [
      ...npByPlacings,
      {
        races: performances.length,
        hits: performances.filter(p =>
          p.starters.some(s => s.placing >= 1 && s.placing <= 4)).length
      }
    ];
  }

  getNegativePerformances = (period: string): NegativePerformance[] => {
    let meetings: string[];
    if (period === 'Recent 10 Meetings') {
      meetings = this.meetings.slice(0, 10);

    } else if (SEASONS.map(s => s.label).some(l => period.includes(l))) {
      const season = SEASONS.find(s => period.includes(s.label))
      meetings = this.meetings
        .filter(m => m >= (season?.opening || '') && m <= (season?.finale || ''));
    }

    return this.negativePerformances.filter(p => meetings.includes(p.meeting));
  }

  getHitRaceOdds = (topn: number, meeting: string, race: number): number =>
    this.performances
      .flatMap(p => p.hits)
      .filter(h => h.topn === topn)
      .flatMap(h => h.races)
      .filter(hr => hr.meeting === meeting && hr.race === race)
      .map(hr => hr.odds)
      .reduce((prev, curr) => prev + curr, 0)

  get meetings(): string[] {
    let meetings = this.performances
      .flatMap(p => p.hits)
      .flatMap(h => h.races)
      .map(hr => hr.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m));

    let negativeMeetings = this.negativePerformances
      .map(p => p.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m));

    return [...meetings, ...negativeMeetings]
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get negativePerformancePeriods(): string[] {
    return ['Recent 10 Meetings', 'Season 23/24'];
  }

  get negativePerformances(): NegativePerformance[] {
    return this.repo.findNegativeEnginePerformances();
  }

  get performances(): SeasonPerformance[] {
    return this.repo.findEnginePerformances();
  }

  get currentSeasonProgress(): string {
    return `${Math.ceil(100 * this.meetings.length / 88)}%`;
  }
}
