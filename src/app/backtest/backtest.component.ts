import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {RATING_FACTOR_MAPS} from '../util/strings';
import {powerSet} from '../util/functions';
import {
  FactorHit,
  FactorHitPlacing,
  MeetingYield,
  TesterYield
} from '../model/backtest.model';

@Component({
  selector: 'app-backtest',
  templateUrl: './backtest.component.html'
})
export class BacktestComponent implements OnInit {
  isLoading = false;
  activeVersion = this.boundaryVersions[0];
  activeFactors: string[] = [RATING_FACTOR_MAPS[0].factor];
  bankerFactors: string[] = [RATING_FACTOR_MAPS[0].factor];

  protected readonly RATING_FACTOR_MAPS = RATING_FACTOR_MAPS;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.runTests();
  }

  process = (action: string) => {
    switch (action) {
      case 'Reset All': {
        this.activeFactors = [RATING_FACTOR_MAPS[0].factor];
        this.bankerFactors = [RATING_FACTOR_MAPS[0].factor];
        break;
      }
      case 'Select All': {
        this.activeFactors = RATING_FACTOR_MAPS.map(m => m.factor);
        break;
      }
      case 'Run Tests': {
        this.runTests();
        break;
      }
      default:
        break;
    }
  }

  runTests = () => {
    this.isLoading = true;
    // this.repo.fetchYields(this.activeFactors, () => this.isLoading = false);
    this.repo.fetchFactorHits(this.factorCombinations, () => this.isLoading = false);
  }

  toggleFactor = (clicked: string, onBanker: boolean = false) => {
    if (onBanker) {
      if (this.bankerFactors.includes(clicked)) {
        this.bankerFactors = this.bankerFactors.filter(f => f !== clicked);

      } else {
        this.bankerFactors.push(clicked);
        if (!this.activeFactors.includes(clicked)) {
          this.activeFactors.push(clicked);
        }
      }
    } else {
      if (this.activeFactors.includes(clicked)) {
        if (this.activeFactors.length > 1) {
          this.activeFactors = this.activeFactors.filter(f => f !== clicked);
          this.bankerFactors = this.bankerFactors.filter(f => f !== clicked);
        }
      } else {
        this.activeFactors.push(clicked);
      }
    }
  }

  formatFactorCombination = (combination: string[]): string =>
    combination
      .map(c => RATING_FACTOR_MAPS.find(rf => rf.factor == c)?.order || 0)
      .sort((fo1, fo2) => fo1 - fo2)
      .map(fo => fo.toString())
      .join(', ')

  isTopPlacingHit = (fhp: FactorHitPlacing): boolean =>
    this.factorHits
      .map(fh => fh.hits.find(h => h.topn === fhp.topn)?.hitRaces || 0)
      .sort((h1, h2) => h2 - h1)
      .slice(0, 3)
      .includes(fhp.hitRaces)

  getReturnOnInvestment = (tyield: TesterYield | MeetingYield): number =>
    parseFloat((tyield.credit / tyield.debit - 1).toFixed(2))

  getProfitRacesOnMeeting = (myield: MeetingYield): number[] =>
    myield.races.filter(r => r.credit > r.debit).map(r => r.race)

  countBetlinesOnMeeting = (myield: MeetingYield): number[] => {
    const betlines = myield.races
      .map(r => r.betlines)
      .reduce((prev, curr) => prev.concat(curr), []);

    const positive = betlines.filter(b => b.credit > b.debit).length;
    return [positive, betlines.length];
  }

  countMeetings = (tyield: TesterYield): number[] => {
    const total = tyield.meetings.length;
    const positive = tyield.meetings
      .filter(m => m.debit > 0 && m.credit > m.debit)
      .length;
    return [positive, total];
  }

  countRaces = (tmYield: TesterYield | MeetingYield): number[] => {
    const allRaces = "races" in tmYield
      ? tmYield?.races
      : tmYield.meetings
        .map(m => m.races)
        .reduce((prev, curr) => prev.concat(curr), []);

    const betRaces = allRaces.filter(r => r.debit > 0);
    const hitRaces = betRaces.filter(r => r.credit > 0);
    const winRaces = hitRaces.filter(r => r.credit > r.debit);
    return [winRaces, hitRaces, betRaces, allRaces].map(e => e.length);
  }

  countBetlines = (tyield: TesterYield): number[] => {
    const betlines = tyield.meetings
      .map(m => m.races.filter(r => r.debit > 0))
      .reduce((prev, curr) => prev.concat(curr), [])
      .map(r => r.betlines)
      .reduce((prev, curr) => prev.concat(curr), []);

    return [
      betlines.filter(b => b.credit > b.debit),
      betlines
    ].map(e => e.length);
  }

  getMeetingROIColor = (myield: MeetingYield): string => {
    const roi = this.getReturnOnInvestment(myield);
    return roi < 0
      ? 'text-red-600'
      : roi >= this.minMeetingROI
        ? 'text-yellow-400'
        : 'text-green-600';
  }

  getTesterROIColor = (tyield: TesterYield): string => {
    const roi = this.getReturnOnInvestment(tyield);
    if (roi < 0) return 'text-red-600';

    const rank = this.yields
      .map(y => this.getReturnOnInvestment(y))
      .sort((r1, r2) => r2 - r1)
      .indexOf(roi);

    return rank > -1 && rank < 5 ? 'text-yellow-400' : 'text-green-600';
  }

  getFactorBadgeStyle = (renderFactor: string): string =>
    this.activeFactors.includes(renderFactor)
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400`

  get factorCombinations(): string[][] {
    return powerSet(this.activeFactors)
      .filter(fc => this.bankerFactors.every(bf => fc.includes(bf)));
  }

  get activeTesterDescription(): string {
    return this.yields
      .find(ty => ty.version === this.activeVersion)
      ?.description || 'Betting Magic';
  }

  get meetingYields(): MeetingYield[] {
    return this.yields
      .find(ty => ty.version === this.activeVersion)
      ?.meetings || [];
  }

  get yields(): TesterYield[] {
    return this.repo.findYields().map(y => {
      y.credit = Math.floor(y.credit);
      return y;
    });
  }

  get factorHits(): FactorHit[] {
    return this.repo.findFactorHits().sort(
      (h1, h2) => h2.totalHits - h1.totalHits
    );
  }

  get testerAvgROI(): number {
    const sum = this.yields
      .map(y => (y.credit / y.debit - 1))
      .reduce((prev, curr) => prev + curr, 0);
    return parseFloat((sum / this.yields.length).toFixed(4));
  }

  get minMeetingROI(): number {
    return 3;
  }

  get boundaryVersions(): string[] {
    return [
      // 'Alpha',
      'W-L1',
      'Q-B1-L4',
      'QP-B1-L4',
      'FB-B1-L4',
      'TBM-B1-L4',
      'FF-B1-L6',
      'QBM-B1-L5',
    ]
  }

  get accuracyFields(): string[] {
    return [
      'Factors', 'WIN', 'QIN', 'TCE', 'QTT', 'Total',
    ];
  }

  get meetingFields(): string[] {
    const fields = this.fields
      .filter((f, index) => index > 0)
      .map(f => f === 'Meetings' ? 'Meeting' : f);

    return [
      ...fields.slice(0, 1),
      'Profit Race #',
      ...fields.slice(1)
    ];
  }

  get fields(): string[] {
    return [
      'Tester',
      'Meetings',
      'Races',
      'Betlines',
      'Debits',
      'Credits',
      'Profit / Loss',
      'ROI'
    ];
  }

  get actions(): string[] {
    return ['Select All', 'Reset All', 'Run Tests'];
  }
}