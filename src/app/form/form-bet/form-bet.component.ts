import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Record} from '../../model/record.model';
import {SEASONS} from '../../util/strings';

@Component({
  selector: 'app-form-bet',
  templateUrl: './form-bet.component.html'
})
export class FormBetComponent implements OnInit {
  activeGroup: string = this.subsections[1][0];
  activeSeason: string = SEASONS[1].label;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchRecords();
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
      : roi >= 3
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

  get meetingViewFields(): string[] {
    return [
      'Meeting', 'Venue', 'Profit Race #', 'Betlines',
      'Debits', 'Credits', 'P / L', 'ROI'
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