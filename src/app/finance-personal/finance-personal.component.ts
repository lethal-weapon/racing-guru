import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {computeSalaryTax} from '../util/tax';
import {MOCKED_TRANSACTIONS} from './transaction.mock';
import {
  DEFAULT_TRANSACTION,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TRANSACTION_METHODS,
  TRANSACTION_TYPES
} from '../model/transaction.model';

const SECTION_INCOME = 'Income';
const SECTION_EXPENSE = 'Expenses';
const SECTION_STATEMENT = 'Statement';
const SECTION_ASSET = 'Assets';
const SECTION_LIABILITY = 'Liabilities';

interface IncomeItem {
  category: string,
  amount: number,
  passive: boolean,
}

interface ExpenseItem {
  category: string,
  amount: number
}

interface AssetItem {
  category: string,
  amount: number,
  current: boolean,
}

interface LiabilityItem {
  category: string,
  amount: number,
  periodInMonth: number,
  annualizedInterestRate: number,
}

@Component({
  selector: 'app-finance-personal',
  templateUrl: './finance-personal.component.html'
})
export class FinancePersonalComponent implements OnInit {

  sortedField: string = this.transactionFields[0];
  isSortAscending: boolean = false;

  editingTransaction: Transaction = {...DEFAULT_TRANSACTION};

  protected readonly SECTION_INCOME = SECTION_INCOME;
  protected readonly SECTION_EXPENSE = SECTION_EXPENSE;
  protected readonly SECTION_STATEMENT = SECTION_STATEMENT;
  protected readonly SECTION_ASSET = SECTION_ASSET;
  protected readonly SECTION_LIABILITY = SECTION_LIABILITY;
  protected readonly TRANSACTION_TYPES = TRANSACTION_TYPES;
  protected readonly TRANSACTION_METHODS = TRANSACTION_METHODS;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    // this.repo.fetchTransactions();
  }

  addTransaction = () => {
    this.editingTransaction = {...DEFAULT_TRANSACTION};
    this.editingTransaction.id = '';
  }

  saveTransaction = () => {
    if (this.editingTransaction.amount <= 0) return;
    if (this.editingTransaction.remark.length < 1) return;

    this.repo.saveTransaction(
      this.editingTransaction,
      (saved: Transaction) => this.editingTransaction = saved
    );
  }

  copyTransaction = (clicked: Transaction) => {
    this.editingTransaction = {...clicked};
    this.editingTransaction.id = '';
  }

  editTransaction = (clicked: Transaction) => {
    this.editingTransaction = {...clicked};
  }

  deleteTransaction = (clicked: Transaction) => {
    if (clicked.id === '') return;

    this.repo.deleteTransaction(
      clicked,
      () => {
      }
    );
  }

  toggleSortable = (field: string) => {
    if (this.sortedField === field) {
      this.isSortAscending = !this.isSortAscending;

    } else {
      this.sortedField = field;
    }
  }

  get cash(): number {
    return 150_000;
  }

  get totalIncome(): number {
    return this.incomes
      .map(i => i.amount)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get totalExpenses(): number {
    return this.expenses
      .map(i => i.amount)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get incomes(): IncomeItem[] {
    return [
      {category: 'Software Developer', amount: 25_895, passive: false},
      {category: 'HKJC Credit', amount: 22_500, passive: false},
      {category: 'Saving Interest', amount: 25, passive: true},
    ]
  }

  get expenses(): ExpenseItem[] {
    const annualNetIncome = this.incomes[0].amount * 14;

    const monthlyRent = 14_000;
    const monthlyMPF = this.incomes[0].amount * 0.05;
    const taxDeduction = monthlyRent * 12 + Math.min(18_000, monthlyMPF * 12);

    const basicAllowance = 132_000;
    const elderlySupport = 50_000 + 25_000;
    const taxAllowance = basicAllowance + elderlySupport;

    let annualTaxableIncome = annualNetIncome - taxDeduction - taxAllowance;
    let annualSalaryTax = computeSalaryTax(annualTaxableIncome);

    const monthlyLoanInterest = this.liabilities
      .map(l => l.amount * l.annualizedInterestRate / 12)
      .reduce((prev, curr) => prev + curr, 0);

    return [
      {category: 'Taxes', amount: annualSalaryTax / 12},
      {category: 'MPF', amount: monthlyMPF},
      {category: 'Food', amount: 2500},
      {category: 'Wear', amount: 300},
      {category: 'Rent', amount: monthlyRent},
      {category: 'Utility', amount: 250},
      {category: 'Transport', amount: 200},
      {category: 'Telecom', amount: 201},
      {category: 'Internet', amount: 276 + 8 + 68 + 78 + 128},
      {category: 'HKJC Debit', amount: 20_000},
      {category: 'Loan Interest', amount: monthlyLoanInterest},
      {category: 'Non-essentials', amount: 800},
    ]
  }

  get assets(): AssetItem[] {
    return [
      {category: 'Landlord Deposit', amount: 28_000, current: false},
    ]
  }

  get liabilities(): LiabilityItem[] {
    return [
      {
        category: 'Mom\'s Loan',
        amount: 100_000,
        periodInMonth: 10,
        annualizedInterestRate: 0.06
      },
    ]
  }

  get transactionLabel(): string {
    return this.editingTransaction.id === ''
      ? `* New Transaction *`
      : `Transaction #${this.editingTransaction.id.slice(0, 7)}`;
  }

  get transactionFields(): string[] {
    return [
      'Date', 'Type', 'Category', 'Method', 'Amount', 'Remark',
    ]
  }

  get categories(): string[] {
    return this.editingTransaction.type === 'Income'
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;
  }

  get sections(): string[] {
    return [
      SECTION_INCOME,
      SECTION_EXPENSE,
      SECTION_STATEMENT,
      SECTION_ASSET,
      SECTION_LIABILITY,
    ];
  }

  get transactions(): Transaction[] {
    const sorter = (t1: Transaction, t2: Transaction) => {
      if (this.sortedField === 'Date') {
        return this.isSortAscending
          ? t1.date.localeCompare(t2.date)
          : t2.date.localeCompare(t1.date)
      }
      if (this.sortedField === 'Type') {
        return this.isSortAscending
          ? t1.type.localeCompare(t2.type)
          : t2.type.localeCompare(t1.type)
      }
      if (this.sortedField === 'Category') {
        return this.isSortAscending
          ? t1.category.localeCompare(t2.category)
          : t2.category.localeCompare(t1.category)
      }
      if (this.sortedField === 'Amount') {
        return this.isSortAscending
          ? t1.amount - t2.amount
          : t2.amount - t1.amount
      }
      if (this.sortedField === 'Remark') {
        return this.isSortAscending
          ? t1.remark.localeCompare(t2.remark)
          : t2.remark.localeCompare(t1.remark)
      }
      return t2.date.localeCompare(t1.date);
    }

    // return this.repo.findTransactions();
    return MOCKED_TRANSACTIONS.sort((t1, t2) => sorter(t1, t2));
  }

  get isLoading(): boolean {
    return this.repo.findTransactions().length === 0;
  }
}
