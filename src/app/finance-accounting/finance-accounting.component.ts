import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

export interface ACCOUNT_ITEM {
  name: string,
  current: boolean,
  description: string,
}

export interface ACCOUNT_GROUP {
  group: string,
  accounts: ACCOUNT_ITEM[],
}

@Component({
  selector: 'app-finance-accounting',
  templateUrl: './finance-accounting.component.html'
})
export class FinanceAccountingComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  get accountGroups(): ACCOUNT_GROUP[] {
    return [
      {
        group: 'Assets',
        accounts: [
          {name: 'Cash', current: true, description: ''},
          {name: 'Accounts Receivable', current: true, description: ''},
          {name: 'Allowance for Doubtful Accounts', current: true, description: ''},
          {name: 'Inventories', current: true, description: ''},
          {name: 'Property, Plant & Equipment', current: false, description: ''},
          {name: 'Accumulated Depreciation', current: false, description: ''},
        ]
      },
      {
        group: 'Liabilities',
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
        accounts: []
      },
      {
        group: 'Equalities',
        accounts: [
          {name: 'Capital Stock', current: true, description: ''},
          {name: 'Retained Earnings', current: true, description: ''},
        ]
      },
      {
        group: 'Expenses',
        accounts: [
          {name: 'COGS', current: true, description: ''},
          {name: 'Operating', current: true, description: ''},
          {name: 'Bad Debt Expense', current: true, description: ''},
          {name: 'Interest Expense', current: true, description: ''},
          {name: 'Depreciation', current: true, description: ''},
        ]
      },
      {
        group: 'Revenues',
        accounts: [
          {name: 'Sales', current: true, description: ''},
        ]
      },
    ]
  }
}
