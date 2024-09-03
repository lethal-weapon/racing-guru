export class Transaction {
  constructor(
    public id: string,
    public date: string,
    public type: string,
    public category: string,
    public method: string,
    public amount: number,
    public remark: string,
  ) {
  }
}

export interface EXPENSE_GROUP {
  group: string,
  categories: string[],
}

export const INCOME_CATEGORIES: string[] = [
  'Salary',
  'HKJC Credit',
  'Saving Interest',
  'Stock Dividend',
];
export const EXPENSE_GROUPS: EXPENSE_GROUP[] = [
  {
    group: 'Government',
    categories: ['Taxes', 'MPF',],
  },
  {
    group: 'Investment',
    categories: ['HKJC Debit', 'Loan Interest', 'Loan Payment',],
  },
  {
    group: 'Essentials',
    categories: ['Food', 'Cloth', 'Rent', 'Utilities', 'Transport', 'Telecom', 'Internet',],
  },
  {
    group: 'Non-essentials',
    categories: ['Non-essentials',],
  },
];
export const EXPENSE_CATEGORIES: string[] = EXPENSE_GROUPS.flatMap(g => g.categories);
export const TRANSACTION_TYPES: string[] = [
  'Income',
  'Expense'
];
export const TRANSACTION_METHODS: string[] = [
  'VISA',
  'Octopus',
  'AlipayHK',
  'FPS',
  'Cash',
];

export const DEFAULT_TRANSACTION: Transaction = {
  id: '',
  date: new Date().toISOString().split('T')[0],
  type: 'Expense',
  category: 'Food',
  method: 'VISA',
  amount: 99,
  remark: '',
}
