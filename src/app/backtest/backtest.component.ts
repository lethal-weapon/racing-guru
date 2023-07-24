import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {MeetingYield, TesterYield} from '../model/backtest.model';

@Component({
  selector: 'app-backtest',
  templateUrl: './backtest.component.html'
})
export class BacktestComponent implements OnInit {
  activeVersion = 'Alpha';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchYields();
  }

  getReturnOnInvestment = (tyield: TesterYield | MeetingYield): number =>
    parseFloat((tyield.credit / tyield.debit - 1).toFixed(2))

  countRacesOnMeeting = (myield: MeetingYield): number[] => {
    const total = myield.races.length;
    const betRaces = myield.races.filter(r => r.debit > 0);
    const positive = betRaces.filter(r => r.credit > r.debit);
    return [positive.length, betRaces.length, total];
  }

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

  countRaces = (tyield: TesterYield): number[] => {
    const totalRaces = tyield.meetings
      .map(m => m.races)
      .reduce((prev, curr) => prev.concat(curr), []);

    const betRaces = totalRaces.filter(r => r.debit > 0);
    const positive = betRaces.filter(r => r.credit > r.debit).length;
    return [positive, betRaces.length, totalRaces.length];
  }

  countBetlines = (tyield: TesterYield): number[] => {
    const betlines = tyield.meetings
      .map(m => m.races.filter(r => r.debit > 0))
      .reduce((prev, curr) => prev.concat(curr), [])
      .map(r => r.betlines)
      .reduce((prev, curr) => prev.concat(curr), []);

    const positive = betlines.filter(b => b.credit > b.debit).length;
    return [positive, betlines.length];
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

  get boundaryVersions(): string[] {
    return [
      // 'Alpha',
      // 'P-L1',
      // 'Q-L4',
      // 'Q-B1-L4',
      // 'QP-L4',
      // 'QP-B1-L5',
      // 'TRI-L6',
      // 'TRI-B1-L5',
      // 'TRI-B2-L4',
      // 'FF-L8',
      // 'FF-B1-L6',
      // 'FF-B2-L4',
      // 'FF-B3-L4',
    ]
  }

  get meetingFields(): string[] {
    return this.fields
      .filter((f, index) => index > 0)
      .map(f => f === 'Meetings' ? 'Meeting' : f);
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

  get testerAvgROI(): number {
    const sum = this.yields
      .map(y => (y.credit / y.debit - 1))
      .reduce((prev, curr) => prev + curr, 0);
    return parseFloat((sum / this.yields.length).toFixed(4));
  }

  get minMeetingROI(): number {
    return 3;
  }
}