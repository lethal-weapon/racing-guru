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
  activeFactors: string[] = [RATING_FACTOR_MAPS[0].factor];
  bankerFactors: string[] = [RATING_FACTOR_MAPS[0].factor];
  minFactorGroupSize = 1;

  activeFactorHitIndex = 0;
  activeVersion = this.boundaryVersions[0];
  sortedAccuracyField = this.sortableAccuracyFields[0];

  protected readonly RATING_FACTOR_MAPS = RATING_FACTOR_MAPS;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.runTests();
  }

  clickAccuracyFieldHeader = (field: string) => {
    if (this.sortableAccuracyFields.includes(field)) {
      this.sortedAccuracyField = field;
    }
  }

  runTests = () => {
    if (this.factorCombinations.length > 0) {
      this.isLoading = true;
      this.repo.fetchFactorHits(this.factorCombinations, () => this.isLoading = false);
    }
  }

  runPredefinedTests = () => {
    this.isLoading = true;
    this.repo.fetchFactorHits([], () => this.isLoading = false);
  }

  process = (action: string) => {
    switch (action) {
      case 'Reset': {
        this.activeFactors = [RATING_FACTOR_MAPS[0].factor];
        this.bankerFactors = [RATING_FACTOR_MAPS[0].factor];
        this.minFactorGroupSize = 1;
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
      case 'Increase Size': {
        this.minFactorGroupSize += 1;
        break;
      }
      case 'Decrease Size': {
        if (this.minFactorGroupSize > Math.max(1, this.bankerFactors.length)) {
          this.minFactorGroupSize -= 1;
        }
        break;
      }
      default:
        break;
    }
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

      if (this.minFactorGroupSize < this.bankerFactors.length) {
        this.minFactorGroupSize = this.bankerFactors.length;
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
      : roi >= 3
        ? 'text-yellow-400'
        : 'text-green-600';
  }

  getTesterROIColor = (tyield: TesterYield): string => {
    const roi = this.getReturnOnInvestment(tyield);
    if (roi < 0) return 'text-red-600';

    const rank = this.activeYields
      .map(y => this.getReturnOnInvestment(y))
      .sort((r1, r2) => r2 - r1)
      .indexOf(roi);

    return rank > -1 && rank < 5 ? 'text-yellow-400' : 'text-green-600';
  }

  getFactorROIColor = (tYields: TesterYield[], isDefault: boolean): string => {
    if (tYields.length === 0) return '';

    const roi = this.getTesterAvgROI(tYields);
    if (roi < 0) return 'text-red-600';

    const rank = this.factorHits
      .map(h => this.getTesterAvgROI(isDefault ? h.defaultYields : h.enhancedYields))
      .sort((r1, r2) => r2 - r1)
      .indexOf(roi);

    return rank > -1 && rank < 5 ? 'text-yellow-400' : 'text-green-600';
  }

  getTesterAvgROI = (yields: TesterYield[]): number => {
    if (yields.length === 0) return 0;
    const sum = yields
      .map(y => (y.credit / y.debit - 1))
      .reduce((prev, curr) => prev + curr, 0);

    return parseFloat((sum / yields.length).toFixed(4));
  }

  getBadgeStyle = (render: string): string =>
    this.activeFactors.includes(render)
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400`

  get meetingYields(): MeetingYield[] {
    return this.activeYields
      .find(ty => ty.version === this.activeVersion)
      ?.meetings || [];
  }

  get activeYields(): TesterYield[] {
    if (this.sortedAccuracyField === 'ROI - B') {
      return this.factorHits
        .map(fh =>
          fh.enhancedYields.map(ey => {
            ey.credit = Math.floor(ey.credit);
            ey.version = this.formatFactorCombination(fh.factors);
            return ey;
          })
        )
        .reduce((prev, curr) => prev.concat(curr));
    }

    if (this.activeFactorHitIndex >= this.factorHits.length) return [];
    return this.factorHits[this.activeFactorHitIndex]
      .defaultYields
      .map(y => {
        y.credit = Math.floor(y.credit);
        return y;
      });
  }

  get factorHits(): FactorHit[] {
    return this.repo.findFactorHits().sort((h1, h2) => {
        if (this.sortedAccuracyField === 'ROI - A') {
          const avgROIa1 = this.getTesterAvgROI(h1.defaultYields)
          const avgROIa2 = this.getTesterAvgROI(h2.defaultYields)
          return (avgROIa2 - avgROIa1) || (h2.totalHits - h1.totalHits);
        }
        if (this.sortedAccuracyField === 'ROI - B') {
          const avgROIb1 = this.getTesterAvgROI(h1.enhancedYields)
          const avgROIb2 = this.getTesterAvgROI(h2.enhancedYields)
          return (avgROIb2 - avgROIb1) || (h2.totalHits - h1.totalHits);
        }
        return h2.totalHits - h1.totalHits;
      }
    );
  }

  get factorCombinations(): string[][] {
    return powerSet(this.activeFactors)
      .filter(fc => this.bankerFactors.every(bf => fc.includes(bf)))
      .filter(fc => fc.length >= this.minFactorGroupSize)
      .sort((fc1, fc2) => fc1.length - fc2.length);
  }

  get boundaryVersions(): string[] {
    return [
      'W-L1', 'Q-B1-L4', 'QP-B1-L4', 'FF-L6',
      'FB-B1-L4', 'TBM-B1-L4', 'QBM-B1-L5',
    ]
  }

  get meetingFields(): string[] {
    const fields = this.profitabilityFields
      .filter((f, index) => index > 0)
      .map(f => f === 'Meetings' ? 'Meeting' : f);

    return [
      ...fields.slice(0, 1),
      'Profit Race #',
      ...fields.slice(1)
    ];
  }

  get profitabilityFields(): string[] {
    return [
      'Tester', 'Meetings', 'Races', 'Betlines',
      'Debits', 'Credits', 'P / L', 'ROI'
    ];
  }

  get sortableAccuracyFields(): string[] {
    return this.accuracyFields.slice(this.accuracyFields.length - 3);
  }

  get accuracyFields(): string[] {
    return [
      'Factors', 'WIN', 'QIN', 'TCE', 'QTT', 'Total',
      'ROI - A', 'ROI - B',
    ];
  }

  get actions(): string[] {
    return ['Reset', 'Select All', 'Run Tests'];
  }
}