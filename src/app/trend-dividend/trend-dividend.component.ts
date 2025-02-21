import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Racecard} from '../model/racecard.model';
import {Starter} from '../model/starter.model';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {DEFAULT_COMBINATIONS, DEFAULT_SINGULARS, Dividend, DIVIDEND_RACE_POOLS} from '../model/dividend.model';
import {formatMeeting, formatRace, isBoundaryMeetingStr, toPlacingColor} from '../util/functions';

const BY_OVERVIEW = 'Overview';
const OVERVIEW_MODES = ['M1', 'M2', 'M3', 'M4'];
const SPECIAL_ORDERS = [1, 7, 11];

@Component({
  selector: 'app-trend-dividend',
  templateUrl: './trend-dividend.component.html'
})
export class TrendDividendComponent implements OnInit {

  activeBadge: string = BY_OVERVIEW;
  activeMode: string = OVERVIEW_MODES[0];

  protected readonly BY_OVERVIEW = BY_OVERVIEW;
  protected readonly OVERVIEW_MODES = OVERVIEW_MODES;
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

  rotateOverviewMode = () => {
    const newIndex =
      (OVERVIEW_MODES.indexOf(this.activeMode) + 1) % OVERVIEW_MODES.length;

    this.activeMode = OVERVIEW_MODES[newIndex];
  }

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  getWinnerStarter = (meeting: string, race: number): Starter | undefined => {
    const card = this.allRacecards.find(r => r.meeting === meeting && r.race === race);
    return card?.starters.find(s => s?.placing === 1);
  }

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

  getDividendTop4 = (meeting: string, race: number): string[] => {
    const starters = this.allRacecards
        .find(r => r.meeting === meeting && r.race === race)
        ?.starters
        .filter(s => (s?.placing || 0) >= 1 && (s?.placing || 0) <= 4)
        .sort((s1, s2) => (s1.placing - s2.placing) || (s1.order - s2.order))
      || [];

    if (starters.length === 0) return [];

    return Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(p => starters
        .filter(s => s.placing === p)
        .map(s => s.order)
        .join('/'));
  }

  isPlayerDouble = (meeting: string, race: number, isTrainer: boolean): boolean => {
    const currentWinnerStarter = this.getWinnerStarter(meeting, race);
    const currentWinnerPlayer = isTrainer
      ? currentWinnerStarter?.trainer || ''
      : currentWinnerStarter?.jockey || '';

    if (currentWinnerPlayer.length < 1) return false;

    const priorWinnerStarter = this.getWinnerStarter(meeting, race - 1);
    const priorWinnerPlayer = isTrainer
      ? priorWinnerStarter?.trainer || ''
      : priorWinnerStarter?.jockey || '';

    const nextWinnerStarter = this.getWinnerStarter(meeting, race + 1);
    const nextWinnerPlayer = isTrainer
      ? nextWinnerStarter?.trainer || ''
      : nextWinnerStarter?.jockey || '';

    if (race === 1) {
      return currentWinnerPlayer === nextWinnerPlayer;
    }

    return (currentWinnerPlayer === nextWinnerPlayer)
      || (currentWinnerPlayer === priorWinnerPlayer);
  }

  isTripleTrioFirstLeg = (meeting: string, race: number): boolean => {
    const card = this.allRacecards.find(r => r.meeting === meeting && r.race === race);
    return (card?.pool?.tripleTrio || 0) > 0;
  }

  isSpecialOrder = (orderStr: string): boolean => {
    if (orderStr.includes('/')) {
      return orderStr
        .split('/')
        .map(n => parseInt(n))
        .some(n => SPECIAL_ORDERS.includes(n));
    }
    return SPECIAL_ORDERS.includes(parseInt(orderStr));
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
