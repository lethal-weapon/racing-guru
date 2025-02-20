import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Racecard} from '../model/racecard.model';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {DEFAULT_COMBINATIONS, DEFAULT_SINGULARS, Dividend, DIVIDEND_RACE_POOLS} from '../model/dividend.model';
import {formatMeeting, formatRace, isBoundaryMeetingStr, toPlacingColor} from '../util/functions';

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
    this.repo.fetchDividends(17);
  }

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  getStarterCount = (meeting: string, race: number): number =>
    (
      this.allRacecards
        .find(r => r.meeting === meeting && r.race === race)
        ?.starters || []
    )
      .filter(s => !s.scratched)
      .length

  getDividendIntensityColor = (meeting: string, race: number): string => {
    const card = this.allRacecards.find(r => r.meeting === meeting && r.race === race);
    if (!card?.dividend?.quartet) return '';

    const profitablePoolCount = DIVIDEND_RACE_POOLS
      .filter(pool => this.getDividendOdds(card?.dividend, pool.name) >= pool.threshold)
      .length;

    if (profitablePoolCount <= 2) return 'bg-red-600';
    if (profitablePoolCount >= 3 && profitablePoolCount <= 4) return 'bg-green-600';
    return 'bg-blue-600';
  }

  getDividendOdds = (d: Dividend, pool: string): number => {
    try {
      switch (pool) {
        case 'WIN':
          return (d?.win || DEFAULT_SINGULARS)[0].odds
        case 'QIN':
          return Math.floor((d?.quinella || DEFAULT_COMBINATIONS)[0].odds)
        case 'FCT':
          return Math.floor((d?.forecast || DEFAULT_COMBINATIONS)[0].odds)
        case 'TRI':
          return Math.floor((d?.trio || DEFAULT_COMBINATIONS)[0].odds)
        case 'F-F':
          return Math.floor((d?.firstFour || DEFAULT_COMBINATIONS)[0].odds)
        case 'TCE':
          return Math.floor((d?.tierce || DEFAULT_COMBINATIONS)[0].odds)
        case 'QTT':
          return Math.floor((d?.quartet || DEFAULT_COMBINATIONS)[0].odds)

        default:
          return 0
      }
    } catch (e) {
      return 0;
    }
  }

  isTripleTrioFirstLeg = (meeting: string, race: number): boolean => {
    const card = this.allRacecards.find(r => r.meeting === meeting && r.race === race);
    return (card?.pool?.tripleTrio || 0) > 0;
  }

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
