export interface FinancialStatement {
  fromDate: string,
  toDate: string,
  lastMonths: number,
  totalIncome: number,
  totalExpense: number,
  paydayAmount: number,
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  assets: AssetItem[],
  liabilities: LiabilityItem[],
}

export interface IncomeItem {
  category: string,
  amount: number,
  passive: boolean,
}

export interface ExpenseItem {
  category: string,
  amount: number,
}

export interface AssetItem {
  category: string,
  amount: number,
  current: boolean,
}

export interface LiabilityItem {
  category: string,
  amount: number,
  months: number,
  annualizedInterestRate: number,
}
