import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Bet} from '../model/bet.model';
import {SEASONS} from '../util/strings';

interface MonthlySummary {
  year: string,
  month: string,
  meetings: number,
  debit: number,
  credit: number,
  roi: number,
  betlines: number[]
}

const BY_MONTH = 'By Month';
const BY_MEETING = 'By Meeting';

@Component({
  selector: 'app-form-bet',
  templateUrl: './form-bet.component.html'
})
export class FormBetComponent implements OnInit {
  activeGroup: string = this.subsections[1][0];
  activeSeason: string = SEASONS[0].label;

  protected readonly BY_MONTH = BY_MONTH;
  protected readonly BY_MEETING = BY_MEETING;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchBets();
  }

  setActiveItem = (sectionIndex: number, item: string) => {
    if (sectionIndex == 0) this.activeSeason = item;
    else this.activeGroup = item;
  }

  countBetlinesOnMeeting = (bet: Bet): number[] =>
    [
      bet.betlines.filter(b => b.credit > b.debit).length,
      bet.betlines.length
    ]

  getReturnOnInvestment = (bet: Bet): number =>
    parseFloat((bet.credit / bet.debit - 1).toFixed(2))

  getMeetingROIColor = (bet: Bet): string => {
    const roi = this.getReturnOnInvestment(bet);
    return roi < 0
      ? 'text-red-600'
      : roi >= 1
        ? 'text-yellow-400'
        : 'text-green-600';
  }

  getProfitRacesOnMeeting = (bet: Bet): number[] =>
    // @ts-ignore
    bet.betlines
      .map(b => b.race)
      .filter(r => r)
      .filter((r, index, arr) => index === arr.indexOf(r))
      .filter(r =>
        0 < bet.betlines
          .filter(b => b.race === r)
          .map(b => b.credit - b.debit)
          .reduce((prev, curr) => prev + curr, 0)
      )

  getSectionStyle = (section: string): string =>
    [this.activeGroup, this.activeSeason].includes(section)
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`

  get monthlySummaries(): MonthlySummary[] {
    return this.bets
      .map(r => r.meeting.slice(0, 7))
      .filter((m, index, arr) => index === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1))
      .map(m => {
          const monthBets = this.bets.filter(r => r.meeting.startsWith(m));
          const monthDebit = monthBets.map(r => r.debit).reduce((prev, curr) => prev + curr, 0);
          const monthCredit = monthBets.map(r => r.credit).reduce((prev, curr) => prev + curr, 0);
          const monthBetlines = monthBets.flatMap(r => r.betlines);

          return {
            year: m.slice(0, 4).replace('20', '\''),
            month: new Date(monthBets[0].meeting).toLocaleString('en-US', {month: 'short'}),
            meetings: monthBets.length,
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
    const betlines = this.bets.flatMap(r => r.betlines);
    return [
      betlines.filter(b => b.credit > b.debit).length,
      betlines.length
    ];
  }

  get seasonSummary(): ({ debit: number, credit: number, roi: number }) {
    if (this.bets.length === 0) return {debit: 0, credit: 0, roi: 0};

    const totalDebit = this.bets
      .map(r => r.debit)
      .reduce((prev, curr) => prev + curr, 0);

    const totalCredit = this.bets
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
      [BY_MEETING, BY_MONTH],
    ];
  }

  get bets(): Bet[] {
    const season = SEASONS.find(s => s.label === this.activeSeason);
    return !season
      ? []
      : this.repo.findBets()
        .filter(r => r.meeting >= season.opening && r.meeting <= season.finale);
  }
}
