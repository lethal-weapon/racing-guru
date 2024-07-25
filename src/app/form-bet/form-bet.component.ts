import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Bet, Betline} from '../model/bet.model';
import {SEASONS} from '../util/strings';

interface MonthlyPoolSummary {
  pool: string,
  debit: number,
  credit: number,
  roi: number
  betlines: number[],
}

interface MonthlySummary {
  year: string,
  month: string,
  meetings: number,
  debit: number,
  credit: number,
  roi: number,
  betlines: number[],
  pools: MonthlyPoolSummary[]
}

const BY_MONTH = 'By Month';
const BY_MEETING = 'By Meeting';
const BY_SUMMARY = 'By Summary';
const BY_POOL = 'By Pool';

@Component({
  selector: 'app-form-bet',
  templateUrl: './form-bet.component.html'
})
export class FormBetComponent implements OnInit {
  activeSeason: string = SEASONS[1].label;
  activeRange: string = this.subsections[1][0];
  activeView: string = this.subsections[2][0];

  protected readonly BY_MONTH = BY_MONTH;
  protected readonly BY_MEETING = BY_MEETING;
  protected readonly BY_SUMMARY = BY_SUMMARY;
  protected readonly BY_POOL = BY_POOL;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchBets();
  }

  setActiveItem = (sectionIndex: number, item: string) => {
    if (sectionIndex == 0) this.activeSeason = item;
    if (sectionIndex == 1) this.activeRange = item;
    if (sectionIndex == 2) this.activeView = item;
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
    if (roi < 0) return 'text-red-600';
    if (roi >= 1) return 'text-yellow-400';
    return 'text-green-600';
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

  filterBetlineByMeetingPool = (bet: Bet, pool: string): Betline[] => {
    switch (pool) {
      case 'WIN & PLA':
        return bet.betlines.filter(b =>
          ['W:', 'P:'].some(p => b.command.toUpperCase().startsWith(p))
          ||
          ['WIN', 'PLA', 'PLACE'].some(p => b.command.toUpperCase().includes(p))
        );
      case 'QQP':
        return bet.betlines.filter(b =>
          ['Q:', 'QP:', 'QQP:'].some(p => b.command.toUpperCase().startsWith(p))
          ||
          ['QIN', 'QPL'].some(p => b.command.toUpperCase().includes(p))
        );
      case 'TRI & F-F':
        return bet.betlines.filter(b =>
          ['TRI', 'FF'].some(p => b.command.toUpperCase().includes(p))
        );
      case 'FCT':
        return bet.betlines.filter(b =>
          ['FS', 'FM', 'FB', 'FBM', 'FMB'].some(p => b.command.toUpperCase().includes(p))
        );
      case 'TCE':
        return bet.betlines.filter(b =>
          ['TS', 'TM', 'TB', 'TBM', 'TMB'].some(p => b.command.toUpperCase().includes(p))
        );
      case 'QTT':
        return bet.betlines.filter(b =>
          ['QS', 'QM', 'QB', 'QBM', 'QMB'].some(p => b.command.toUpperCase().includes(p))
        );
      case 'Others':
        return bet.betlines.filter(b =>
          !(
            ['W:', 'P:'].some(p => b.command.toUpperCase().startsWith(p))
            ||
            ['WIN', 'PLA', 'PLACE'].some(p => b.command.toUpperCase().includes(p))
            ||
            ['Q:', 'QP:', 'QQP:'].some(p => b.command.toUpperCase().startsWith(p))
            ||
            ['QIN', 'QPL'].some(p => b.command.toUpperCase().includes(p))
            ||
            ['TRI', 'FF'].some(p => b.command.toUpperCase().includes(p))
            ||
            ['FS', 'FM', 'FB', 'FBM', 'FMB'].some(p => b.command.toUpperCase().includes(p))
            ||
            ['TS', 'TM', 'TB', 'TBM', 'TMB'].some(p => b.command.toUpperCase().includes(p))
            ||
            ['QS', 'QM', 'QB', 'QBM', 'QMB'].some(p => b.command.toUpperCase().includes(p))
          )
        );
      default:
        return [...bet.betlines];
    }
  }

  getValueByMeetingPool = (bet: Bet, pool: string, isDebit: boolean): number =>
    this.filterBetlineByMeetingPool(bet, pool)
      .map(b => isDebit ? b.debit : b.credit)
      .reduce((prev, curr) => prev + curr, 0)

  getSectionStyle = (section: string): string =>
    [this.activeSeason, this.activeRange, this.activeView].includes(section)
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
          const monthPools = this.meetingPoolViewFields.map(p => {
            const monthDebitByPool = monthBets
              .map(b => this.getValueByMeetingPool(b, p, true))
              .reduce((prev, curr) => prev + curr, 0);

            const monthCreditByPool = monthBets
              .map(b => this.getValueByMeetingPool(b, p, false))
              .reduce((prev, curr) => prev + curr, 0);

            const monthBetlinesByPool = monthBets
              .flatMap(b => this.filterBetlineByMeetingPool(b, p));

            return {
              pool: p,
              debit: monthDebitByPool,
              credit: monthCreditByPool,
              roi: parseFloat((monthCreditByPool / monthDebitByPool - 1).toFixed(3)),
              betlines: [
                monthBetlinesByPool.filter(b => b.credit > b.debit).length,
                monthBetlinesByPool.length
              ],
            }
          });

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
            ],
            pools: monthPools
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

  get meetingPoolViewFields(): string[] {
    return [
      'WIN & PLA', 'QQP', 'TRI & F-F', 'FCT', 'TCE', 'QTT', 'Others'
    ];
  }

  get meetingSummaryViewFields(): string[] {
    return [
      'Meeting', 'Venue', 'Profit Race #',
      'Betlines', 'Debit', 'Credit', 'P / L', 'ROI'
    ];
  }

  get subsections(): string[][] {
    return [
      SEASONS.map(s => s.label),
      [BY_MEETING, BY_MONTH],
      [BY_SUMMARY, BY_POOL],
    ];
  }

  get bets(): Bet[] {
    const season = SEASONS.find(s => s.label === this.activeSeason);
    return !season
      ? []
      : this.repo.findBets()
        .filter(r => r.meeting >= season.opening && r.meeting <= season.finale);
  }

  get isLoading(): boolean {
    return this.repo.findBets().length === 0;
  }
}
