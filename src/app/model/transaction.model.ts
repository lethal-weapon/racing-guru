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

export const INCOME_CATEGORIES = [
  'Paycheck',
  'HKJC Credit',
  'Saving Interest',
  'Stock Dividend',
];
export const EXPENSE_CATEGORIES = [
  'Taxes',
  'MPF',
  'Food',
  'Cloth',
  'Rent',
  'Utility',
  'Transport',
  'Telecom',
  'Internet',
  'HKJC Debit',
  'Loan Interest',
  'Loan Payment',
  'Non-essentials',
];
export const TRANSACTION_TYPES = [
  'Income',
  'Expense'
];
export const TRANSACTION_METHODS = [
  'VISA',
  'Octopus',
  'AlipayHK',
  'FPS',
  'Cash',
];

export const DEFAULT_TRANSACTION: Transaction = {
  id: '',
  date: new Date().toISOString().split('T')[0],
  type: TRANSACTION_TYPES[1],
  category: EXPENSE_CATEGORIES[2],
  method: TRANSACTION_METHODS[0],
  amount: 99,
  remark: '',
}
