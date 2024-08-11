import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {powerSet} from '../util/functions';
import {
  Factor,
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
  activeMode: string = this.modes[1];
  activeFactorHitIndex = 0;
  activeVersion = '';

  activeFactors: string[] = [];
  bankerFactors: string[] = [];
  hoveringFactor: Factor | undefined;
  minFactorGroupSize = 1;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchBacktestFactors(() => {
      this.hoveringFactor = this.factors[0];
      this.activeFactors = [this.factors[0].name];
      this.bankerFactors = [this.factors[0].name];
    });
  }

  setActiveMode = (clicked: string) => {
    if (!this.isLoading) {
      this.activeMode = clicked;
      this.process('Reset');
    }
  }

  process = (action: string) => {
    switch (action) {
      case 'Reset': {
        this.hoveringFactor = this.factors[0];
        this.activeFactors = [this.factors[0].name];
        this.bankerFactors = [this.factors[0].name];
        this.minFactorGroupSize = 1;
        break;
      }
      case 'Select All': {
        this.activeFactors = this.factors.map(m => m.name);
        break;
      }
      case 'Run Tests': {
        if (this.factorCombinations.length > 0) {
          this.isLoading = true;

          if (this.isGeneralModeActive) {
            this.repo.fetchGeneralChanceFactorHits(
              this.factorCombinations,
              () => this.isLoading = false
            );
          } else {
            this.repo.fetchExactChanceFactorHits(
              this.factorCombinations,
              () => this.isLoading = false
            );
          }
        }
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
      .map(c => this.factors.find(rf => rf.name == c)?.order || 0)
      .sort((f1, f2) => f1 - f2)
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
    const betlines = myield.races.flatMap(r => r.betlines);
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
    const allRaces = 'races' in tmYield
      ? tmYield?.races
      : tmYield.meetings.flatMap(m => m.races);

    const betRaces = allRaces.filter(r => r.debit > 0);
    const hitRaces = betRaces.filter(r => r.credit > 0);
    const winRaces = hitRaces.filter(r => r.credit > r.debit);
    return [winRaces, hitRaces, betRaces, allRaces].map(e => e.length);
  }

  countBetlines = (tyield: TesterYield): number[] => {
    const betlines = tyield.meetings
      .flatMap(m => m.races.filter(r => r.debit > 0))
      .flatMap(r => r.betlines);

    return [
      betlines.filter(b => b.credit > b.debit),
      betlines
    ].map(e => e.length);
  }

  getMeetingROIColor = (myield: MeetingYield): string => {
    const roi = this.getReturnOnInvestment(myield);
    if (roi < 0) return 'text-red-600';
    return roi >= 3 ? 'text-yellow-400' : 'text-green-600';
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

  getFactorROIColor = (tYields: TesterYield[]): string => {
    if (tYields.length === 0) return '';

    const roi = this.getTesterAvgROI(tYields);
    if (roi < 0) return 'text-red-600';

    const rank = this.factorHits
      .map(h => this.getTesterAvgROI(h.yields))
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

  getModeStyle = (render: string): string =>
    this.activeMode === render
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`

  getBadgeStyle = (render: string): string =>
    this.activeFactors.includes(render)
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400`

  get meetingYields(): MeetingYield[] {
    return (
      this.activeYields
      .find(ty => ty.version === this.activeVersion)
      ?.meetings || []
    )
      .map(m => m)
      .sort((m1, m2) => m2.meeting.localeCompare(m1.meeting))
  }

  get activeYields(): TesterYield[] {
    if (this.activeFactorHitIndex >= this.factorHits.length) return [];
    return this.factorHits[this.activeFactorHitIndex]
      .yields
      .map(y => {
        y.credit = Math.floor(y.credit);
        return y;
      });
  }

  get factorHits(): FactorHit[] {
    return this.repo.findFactorHits().sort((h1, h2) => {
        const avgROI1 = this.getTesterAvgROI(h1.yields)
        const avgROI2 = this.getTesterAvgROI(h2.yields)
        return (avgROI2 - avgROI1) || (h2.totalHits - h1.totalHits);
      }
    );
  }

  get factorCombinations(): string[][] {
    return powerSet(this.activeFactors)
      .filter(fc => this.bankerFactors.every(bf => fc.includes(bf)))
      .filter(fc => fc.length >= this.minFactorGroupSize)
      .sort((fc1, fc2) => fc1.length - fc2.length);
  }

  get meetingFields(): string[] {
    return [
      'Meeting', 'Profit Race #', 'Races', 'Betlines',
      'Debits', 'Credits', 'P / L', 'ROI'
    ];
  }

  get profitabilityFields(): string[] {
    return [
      'Tester', 'Meetings', 'Races', 'Betlines',
      'Debits', 'Credits', 'P / L', 'ROI'
    ];
  }

  get accuracyFields(): string[] {
    return ['Factors', '3W', '4Q', '5T', '6F', 'Total', 'ROI'];
  }

  get actions(): string[] {
    return ['Reset', 'Select All', 'Run Tests'];
  }

  get isGeneralModeActive(): boolean {
    return this.activeMode === this.modes[0];
  }

  get modes(): string[] {
    return ['General', 'Exact'];
  }

  get factors(): Factor[] {
    return this.repo.findFactors()
      .filter(f => this.isGeneralModeActive ? f.general : !f.general);
  }
}
