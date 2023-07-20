import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {TesterYield} from '../model/backtest.model';

@Component({
  selector: 'app-backtest',
  templateUrl: './backtest.component.html'
})
export class BacktestComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchYields();
  }

  getReturnOnInvestment = (tyield: TesterYield): number =>
    parseFloat((tyield.credit / tyield.debit - 1).toFixed(2))

  countMeetings = (tyield: TesterYield): number[] => {
    const total = tyield.meetings.length;
    const positive = tyield.meetings.filter(m => m.credit > m.debit).length;
    return [positive, total];
  }

  countRaces = (tyield: TesterYield): number[] => {
    const races = tyield.meetings
      .map(m => m.races.filter(r => r.debit > 0))
      .reduce((prev, curr) => prev.concat(curr), []);

    const positive = races.filter(r => r.credit > r.debit).length;
    return [positive, races.length];
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

  get yields(): TesterYield[] {
    return this.repo.findYields().map(y => {
      y.credit = Math.floor(y.credit);
      return y;
    });
  }
}