import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Racecard} from '../model/racecard.model';
import {Starter} from '../model/starter.model';
import {COLORS} from '../util/strings';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {DEFAULT_COMBINATIONS, DEFAULT_SINGULARS, Dividend, DIVIDEND_RACE_POOLS} from '../model/dividend.model';
import {formatMeeting, formatRace, isBoundaryMeetingStr, toPlacingColor} from '../util/functions';

const BY_OVERVIEW = 'Overview';
const OVERVIEW_MODES = ['M1', 'M2', 'M3', 'M4'];
const SPECIAL_ORDERS = [1, 7, 11];
const SPECIAL_ORDER_DIVIDEND_MODES = ['WIN', 'PLA',];

@Component({
  selector: 'app-trend-dividend',
  templateUrl: './trend-dividend.component.html'
})
export class TrendDividendComponent implements OnInit {

  activeBadge: string = BY_OVERVIEW;
  activeMode: string = OVERVIEW_MODES[0];
  activeDividendMode: string = SPECIAL_ORDER_DIVIDEND_MODES[0];

  protected readonly COLORS = COLORS;
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
    if (this.repo.findDividends().length < 2) {
      this.repo.fetchDividends(17);
    }
  }

  rotateOverviewMode = () => {
    const newIndex =
      (OVERVIEW_MODES.indexOf(this.activeMode) + 1) % OVERVIEW_MODES.length;

    this.activeMode = OVERVIEW_MODES[newIndex];
  }

  rotateSpecialOrderDividendMode = () => {
    const newIndex =
      (SPECIAL_ORDER_DIVIDEND_MODES.indexOf(this.activeDividendMode) + 1)
      % SPECIAL_ORDER_DIVIDEND_MODES.length;

    this.activeDividendMode = SPECIAL_ORDER_DIVIDEND_MODES[newIndex];
  }

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  getWinnerStarter = (meeting: string, race: number): Starter | undefined => {
    const card = meeting === this.latestRacecards[0].meeting
      ? this.latestRacecards.find(r => r.race === race)
      : this.allRacecards.find(r => r.meeting === meeting && r.race === race);

    return card?.starters.find(s => s?.placing === 1);
  }

  getStarterCount = (meeting: string, race: number): number =>
    (
      (
        meeting === this.latestRacecards[0].meeting
          ? this.latestRacecards.find(r => r.race === race)
          : this.allRacecards.find(r => r.meeting === meeting && r.race === race)
      )
        ?.starters || []
    )
      .filter(s => !s.scratched)
      .length

  getDividendIntensityColor = (meeting: string, race: number): string => {
    const card = meeting === this.latestRacecards[0].meeting
      ? this.latestRacecards.find(r => r.race === race)
      : this.allRacecards.find(r => r.meeting === meeting && r.race === race);

    if (!card?.dividend?.tierce) return '';

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
    const starters =
      (
        (
          meeting === this.latestRacecards[0].meeting
            ? this.latestRacecards.find(r => r.race === race)
            : this.allRacecards.find(r => r.meeting === meeting && r.race === race)
        )
          ?.starters || []
      )
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

  getRaceCountByMeetingAndIntensity = (meeting: string, intensityOrder: number): number =>
    Array(MAX_RACE_PER_MEETING)
      .fill(1)
      .map((_, index) => 1 + index)
      .map(race => this.getDividendIntensityColor(meeting, race))
      .filter(color => {
        if (intensityOrder === 1) return color === 'bg-red-600';
        if (intensityOrder === 2) return color === 'bg-green-600';
        if (intensityOrder === 3) return color === 'bg-blue-600';
        return false;
      })
      .length

  getSpecialOrderDividend = (race: number): number =>
    this.allRacecards
      .filter(d => d.race === race)
      .map(d => {
        if (this.activeDividendMode === 'WIN') {
          if (!d?.dividend?.win) return 0;
          return SPECIAL_ORDERS
            .map(o => (d.dividend.win.find(s => s.order === o)?.odds || 0) - 1)
            .reduce((prev, curr) => prev + curr, 0);

        } else if (this.activeDividendMode === 'PLA') {
          if (!d?.dividend?.place) return 0;
          return SPECIAL_ORDERS
            .map(o => (d.dividend.place.find(s => s.order === o)?.odds || 0) - 1)
            .reduce((prev, curr) => prev + curr, 0);
        }
        return 0;
      })
      .reduce((prev, curr) => prev + curr, 0);

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

  isHighlightOverviewCell = (meeting: string, race: number): boolean => {
    if (this.activeMode !== OVERVIEW_MODES[3]) {
      return this.isTripleTrioFirstLeg(meeting, race);
    }

    return this.getDividendTop4(meeting, race)
      .filter(o => this.isSpecialOrder(o))
      .length > 1;
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

  isTripleTrioFirstLeg = (meeting: string, race: number): boolean => {
    const card = meeting === this.latestRacecards[0].meeting
      ? this.latestRacecards.find(r => r.race === race)
      : this.allRacecards.find(r => r.meeting === meeting && r.race === race);

    return (card?.pool?.tripleTrio || 0) > 0;
  }

  get meetings(): string[] {
    return this.raceOneCards.map(d => d.meeting);
  }

  get raceOneCards(): Racecard[] {
    return this.allRacecards.filter(d => d.race === 1);
  }

  get activeRacecards(): Racecard[] {
    if (this.activeBadge === this.latestRacecards[0].meeting) {
      return this.latestRacecards;
    }
    return this.allRacecards.filter(d => d.meeting === this.activeBadge);
  }

  get allRacecards(): Racecard[] {
    return this.repo.findDividends();
  }

  get latestRacecards(): Racecard[] {
    return this.repo.findRacecards();
  }

  get isLoading(): boolean {
    return this.repo.findDividends().length < 2
      || this.repo.findRacecards().length < 2;
  }
}
