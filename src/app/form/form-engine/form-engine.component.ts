import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {SeasonPerformance} from '../../model/performance.model';
import {PLACING_MAPS} from '../../util/strings';
import {MAX_RACE_PER_MEETING} from '../../util/numbers';

@Component({
  selector: 'app-form-engine',
  templateUrl: './form-engine.component.html'
})
export class FormEngineComponent implements OnInit {

  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchEnginePerformance();
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  formatPlacing = (placing: string): string => {
    switch (placing) {
      case 'W':
        return 'WIN';
      case 'Q':
        return 'QIN';
      case 'P':
        return 'TCE';
      case 'F':
        return 'QTT';
      default:
        return '?';
    }
  }

  formatOdds = (topn: number, odds: number): string =>
    odds < 10 ? odds.toFixed(1) : Math.floor(odds).toString()

  getHitRaceOdds = (topn: number, meeting: string, race: number): number =>
    this.performances
      .map(p => p.hits)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(h => h.topn === topn)
      .map(h => h.races)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(hr => hr.meeting === meeting && hr.race === race)
      .map(hr => hr.odds)
      .reduce((prev, curr) => prev + curr, 0)

  get meetings(): string[] {
    return this.performances
      .map(p => p.hits)
      .reduce((prev, curr) => prev.concat(curr), [])
      .map(h => h.races)
      .reduce((prev, curr) => prev.concat(curr), [])
      .map(hr => hr.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get performances(): SeasonPerformance[] {
    return this.repo.findPerformances();
  }
}