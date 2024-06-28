import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Record} from '../../model/record.model';
import {SEASONS} from '../../util/strings';

interface MonthlySummary {
  year: string,
  month: string,
  meetings: number,
  debit: number,
  credit: number,
  roi: number,
  betlines: number[]
}

@Component({
  selector: 'app-form-bet',
  templateUrl: './form-bet.component.html'
})
export class FormBetComponent implements OnInit {
  activeGroup: string = this.subsections[1][0];
  activeSeason: string = SEASONS[0].label;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    // this.repo.fetchRecords();
  }

  setActiveItem = (sectionIndex: number, item: string) => {
    if (sectionIndex == 0) this.activeSeason = item;
    else this.activeGroup = item;
  }

  countBetlinesOnMeeting = (record: Record): number[] =>
    [
      record.betlines.filter(b => b.credit > b.debit).length,
      record.betlines.length
    ]

  getReturnOnInvestment = (record: Record): number =>
    parseFloat((record.credit / record.debit - 1).toFixed(2))

  getMeetingROIColor = (record: Record): string => {
    const roi = this.getReturnOnInvestment(record);
    return roi < 0
      ? 'text-red-600'
      : roi >= 1
        ? 'text-yellow-400'
        : 'text-green-600';
  }

  getProfitRacesOnMeeting = (record: Record): number[] =>
    // @ts-ignore
    record.betlines
      .map(b => b.race)
      .filter(r => r)
      .filter((r, index, arr) => index === arr.indexOf(r))
      .filter(r =>
        0 < record.betlines
          .filter(b => b.race === r)
          .map(b => b.credit - b.debit)
          .reduce((prev, curr) => prev + curr, 0)
      )

  getSectionStyle = (section: string): string =>
    [this.activeGroup, this.activeSeason].includes(section)
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`

  get monthlySummaries(): MonthlySummary[] {
    return this.records
      .map(r => r.meeting.slice(0, 7))
      .filter((m, index, arr) => index === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1))
      .map(m => {
          const monthRecords = this.records.filter(r => r.meeting.startsWith(m));
          const monthDebit = monthRecords.map(r => r.debit).reduce((prev, curr) => prev + curr, 0);
          const monthCredit = monthRecords.map(r => r.credit).reduce((prev, curr) => prev + curr, 0);
          const monthBetlines = monthRecords
            .map(r => r.betlines)
            .reduce((prev, curr) => prev.concat(curr), []);

          return {
            year: m.slice(0, 4).replace('20', '\''),
            month: new Date(monthRecords[0].meeting).toLocaleString('en-US', {month: 'short'}),
            meetings: monthRecords.length,
            debit: monthDebit,
            credit: monthCredit,
            roi: parseFloat((monthCredit / monthDebit - 1).toFixed(3)),
            betlines: [
              monthBetlines.filter(b => b.credit > b.debit).length,
              monthBetlines.length
            ]
          }
        }
      );
  }

  get seasonBetlines(): number[] {
    const totalBetlines = this.records
      .map(r => r.betlines)
      .reduce((prev, curr) => prev.concat(curr), []);

    return [
      totalBetlines.filter(b => b.credit > b.debit).length,
      totalBetlines.length
    ];
  }

  get seasonSummary(): ({ debit: number, credit: number, roi: number }) {
    if (this.records.length === 0) return {debit: 0, credit: 0, roi: 0};

    const totalDebit = this.records
      .map(r => r.debit)
      .reduce((prev, curr) => prev + curr, 0);

    const totalCredit = this.records
      .map(r => r.credit)
      .reduce((prev, curr) => prev + curr, 0);

    return {
      debit: totalDebit,
      credit: totalCredit,
      roi: parseFloat((totalCredit / totalDebit - 1).toFixed(4))
    };
  }

  get meetingViewFields(): string[] {
    return [
      'Meeting', 'Venue', 'Profit Race #', 'Betlines',
      'Debit', 'Credit', 'P / L', 'ROI'
    ];
  }

  get subsections(): string[][] {
    return [
      SEASONS.map(s => s.label),
      ['By Meeting', 'By Month'],
    ];
  }

  get records(): Record[] {
    const season = SEASONS.find(s => s.label === this.activeSeason);
    return !season
      ? []
      : this.repo.findRecords()
        .filter(r => r.meeting >= season.opening && r.meeting <= season.finale);
  }
}
