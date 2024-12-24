import {today} from '../util/functions';

export class Journal {
  constructor(
    public id: string,
    public date: string,
    public description: string,
    public entries: Entry[],
  ) {
  }
}

export const DEFAULT_JOURNAL: Journal = {
  id: '',
  date: today(),
  description: '',
  entries: [],
}

export interface Entry {
  accountGroup: string,
  account: string,
  debit: number,
  credit: number,
}

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

export const ACCOUNT_GROUPS: ACCOUNT_GROUP[] = [
  {
    group: 'Asset',
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
    group: 'Liability',
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
    group: 'Dividend',
    debit: true,
    accounts: [
      {name: 'Dividend', current: true, description: ''},
    ]
  },
  {
    group: 'Equity',
    debit: false,
    accounts: [
      {name: 'Capital Stock', current: true, description: ''},
      {name: 'Retained Earnings', current: true, description: ''},
    ]
  },
  {
    group: 'Expense',
    debit: true,
    accounts: [
      {name: 'COGS', current: true, description: ''},
      {name: 'Operating', current: true, description: ''},
      {name: 'Bad Debt', current: true, description: ''},
      {name: 'Interest', current: true, description: ''},
      {name: 'Depreciation', current: true, description: ''},
    ]
  },
  {
    group: 'Revenue',
    debit: false,
    accounts: [
      {name: 'Sales', current: true, description: ''},
    ]
  },
];

export const createNewJournal = () => ({
  ...DEFAULT_JOURNAL,
  entries: [
    {
      accountGroup: ACCOUNT_GROUPS[0].group,
      account: ACCOUNT_GROUPS[0].accounts[0].name,
      debit: 0,
      credit: 0,
    },
    {
      accountGroup: ACCOUNT_GROUPS[1].group,
      account: ACCOUNT_GROUPS[1].accounts[0].name,
      debit: 0,
      credit: 0,
    },
  ]
})
