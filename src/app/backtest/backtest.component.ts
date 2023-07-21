import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {MeetingYield, TesterYield} from '../model/backtest.model';

@Component({
  selector: 'app-backtest',
  templateUrl: './backtest.component.html'
})
export class BacktestComponent implements OnInit {
  activeVersion = '';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchYields();
  }

  setActiveVersion = (clicked: string) =>
    this.activeVersion = this.activeVersion === clicked ? '' : clicked

  getReturnOnInvestment = (tyield: TesterYield | MeetingYield): number =>
    parseFloat((tyield.credit / tyield.debit - 1).toFixed(2))

  countRacesOnMeeting = (myield: MeetingYield): number[] => {
    const total = myield.races.length;
    const betRaces = myield.races.filter(r => r.debit > 0);
    const positive = betRaces.filter(r => r.credit > r.debit);
    return [positive.length, betRaces.length, total];
  }

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
}