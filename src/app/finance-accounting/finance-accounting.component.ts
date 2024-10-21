import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

export interface ACCOUNT_ITEM {
  name: string,
  current: boolean,
  description: string,
}

export interface ACCOUNT_GROUP {
  group: string,
  debit: boolean,
  accounts: ACCOUNT_ITEM[],
}

const TRANSACTION_PAGE_SIZE = 10;

@Component({
  selector: 'app-finance-accounting',
  templateUrl: './finance-accounting.component.html'
})
export class FinanceAccountingComponent implements OnInit {

  protected readonly TRANSACTION_PAGE_SIZE = TRANSACTION_PAGE_SIZE;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  get accountGroups(): ACCOUNT_GROUP[] {
    return [
      {
        group: 'Assets',
        debit: true,
        accounts: [
          {name: 'Cash', current: true, description: ''},
          {name: 'Accounts Receivable', current: true, description: ''},
          {
            name: 'Allowance for Doubtful Accounts',
            current: true,
            description: 'Contra Account Against Accounts Receivable'
          },
          {name: 'Inventory', current: true, description: ''},
          {name: 'Capital Assets (PPE)', current: false, description: ''},
          {
            name: 'Accumulated Depreciation',
            current: false,
            description: 'Contra Account Against Capital Assets'
          },
        ]
      },
      {
        group: 'Liabilities',
        debit: false,
        accounts: [
          {name: 'Short-term Loan', current: true, description: ''},
          {name: 'Accounts Payable', current: true, description: ''},
          {name: 'Unearned Revenue', current: true, description: ''},
          {name: 'Long-term Loan', current: false, description: ''},
          {name: 'Accrued Liabilities', current: false, description: ''},
        ]
      },
      {
        group: 'Dividends',
        debit: true,
        accounts: [
          {name: 'Dividend', current: true, description: ''},
        ]
      },
      {
        group: 'Equalities',
        debit: false,
        accounts: [
          {name: 'Capital Stock', current: true, description: ''},
          {name: 'Retained Earnings', current: true, description: ''},
        ]
      },
      {
        group: 'Expenses',
        debit: true,
        accounts: [
          {name: 'COGS', current: true, description: ''},
          {name: 'Operating Expense', current: true, description: ''},
          {name: 'Bad Debt Expense', current: true, description: ''},
          {name: 'Interest Expense', current: true, description: ''},
          {name: 'Depreciation', current: true, description: ''},
        ]
      },
      {
        group: 'Revenues',
        debit: false,
        accounts: [
          {name: 'Sales', current: true, description: ''},
        ]
      },
    ]
  }
}
