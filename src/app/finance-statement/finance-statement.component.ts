import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {ACCOUNT_GROUPS, Journal} from '../model/journal.model';

const STATEMENT_INCOME = 'Income Statement';
const STATEMENT_BALANCE_SHEET = 'Balance Sheet';
const STATEMENT_CASHFLOW = 'Cashflow Statement';
const STATEMENT_CHANGE_IN_EQUITY = 'Statement of Changes in Equity';

@Component({
  selector: 'app-finance-statement',
  templateUrl: './finance-statement.component.html'
})
export class FinanceStatementComponent implements OnInit {

  protected readonly STATEMENT_INCOME = STATEMENT_INCOME;
  protected readonly STATEMENT_BALANCE_SHEET = STATEMENT_BALANCE_SHEET;
  protected readonly STATEMENT_CASHFLOW = STATEMENT_CASHFLOW;
  protected readonly STATEMENT_CHANGE_IN_EQUITY = STATEMENT_CHANGE_IN_EQUITY;

  protected readonly math = Math;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchJournals();
  }

  getAccountTotal = (account: string): number =>
    this.journals
      .flatMap(j => j.entries)
      .filter(e => e.account === account)
      .map(e => e.debit > 0 ? e.debit : -e.credit)
      .reduce((prev, curr) => prev + curr, 0)

  getAccountSummaryByAccount =
    (accounts: string[]): Array<{ account: string, amount: number }> => {

      let accountTotals = accounts.map(acc => ({
        account: acc,
        amount: this.getAccountTotal(acc)
      }))

      accountTotals.forEach(at => {
        if (at.account.includes('Receivable')) {
          at.amount += this.getAccountTotal('Allowance for Doubtful Accounts');
        }
        if (at.account.includes('PPE')) {
          at.amount += this.getAccountTotal('Accumulated Depreciation');
        }
      });

      return accountTotals;
    }

  getAccountSummaryByGroup =
    (accountGroup: string): Array<{ account: string, amount: number }> => {

      return (ACCOUNT_GROUPS.find(ag => ag.group === accountGroup)?.accounts || [])
        .map(acc => ({
          account: acc.name,
          amount: this.getAccountTotal(acc.name)
        }))
    }

  getBalanceSheetSubtotal = (accounts: string[]): number =>
    this
      .getAccountSummaryByAccount(accounts)
      .map(a => Math.abs(a.amount))
      .reduce((prev, curr) => prev + curr, 0);

  get totalExpense(): number {
    return this.getAccountSummaryByGroup(this.incomeAccountGroups[1])
      .map(a => a.amount)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get netIncome(): number {
    const totalRevenue =
      this.getAccountSummaryByGroup(this.incomeAccountGroups[0])
        .map(a => a.amount)
        .reduce((prev, curr) => prev + curr, 0);

    return Math.abs(totalRevenue) - Math.abs(this.totalExpense);
  }

  get incomeAccountGroups(): string[] {
    return ['Revenue', 'Expense'];
  }

  get totalAssets(): number {
    return this.getBalanceSheetSubtotal(
      this.balanceSheetGroups
        .filter(g => g.group.includes('Asset'))
        .flatMap(g => g.accounts)
    );
  }

  get totalLiabilities(): number {
    return this.getBalanceSheetSubtotal(
      this.balanceSheetGroups
        .filter(g => g.group.includes('Liability'))
        .flatMap(g => g.accounts)
    );
  }

  get balanceSheetGroups(): Array<{ group: string, accounts: string[] }> {
    return [
      {
        group: 'Current Assets',
        accounts: ['Cash', 'Accounts Receivable']
      },
      {
        group: 'Non-current Assets',
        accounts: ['Capital Assets (PPE)',]
      },
      {
        group: 'Current Liability',
        accounts: ['Accounts Payable', 'Accrued Liabilities']
      },
      {
        group: 'Non-current Liability',
        accounts: ['Long-term Loan',]
      },
    ]
  }

  get statements(): string[] {
    return [
      STATEMENT_INCOME,
      STATEMENT_BALANCE_SHEET,
      STATEMENT_CASHFLOW,
      STATEMENT_CHANGE_IN_EQUITY,
    ];
  }

  get journals(): Journal[] {
    return this.repo.findJournals();
  }

  get isLoading(): boolean {
    return this.repo.findJournals().length === 0;
  }
}
