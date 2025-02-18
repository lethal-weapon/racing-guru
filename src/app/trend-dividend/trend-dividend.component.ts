import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Racecard} from '../model/racecard.model';
import {formatMeeting, formatRace, isBoundaryMeetingStr, toPlacingColor} from '../util/functions';
import {MAX_RACE_PER_MEETING} from '../util/numbers';

const BY_OVERVIEW = 'Overview';

@Component({
  selector: 'app-trend-dividend',
  templateUrl: './trend-dividend.component.html'
})
export class TrendDividendComponent implements OnInit {

  activeBadge: string = BY_OVERVIEW;

  protected readonly BY_OVERVIEW = BY_OVERVIEW;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;
  protected readonly formatRace = formatRace;
  protected readonly formatMeeting = formatMeeting;
  protected readonly toPlacingColor = toPlacingColor;
  protected readonly isBoundaryMeetingStr = isBoundaryMeetingStr;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchDividends(8);
  }

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  get meetings(): string[] {
    return this.raceOneCards.map(d => d.meeting);
  }

  get raceOneCards(): Racecard[] {
    return this.allRacecards.filter(d => d.race === 1);
  }

  get activeRacecards(): Racecard[] {
    return this.allRacecards.filter(d => d.meeting === this.activeBadge);
  }

  get allRacecards(): Racecard[] {
    return this.repo.findDividends();
  }

  get isLoading(): boolean {
    return this.repo.findDividends().length < 2;
  }
}
