import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {ExpenseItem, FinancialStatement, IncomeItem} from '../model/financial.model';
import {
  DEFAULT_TRANSACTION,
  EXPENSE_CATEGORIES,
  EXPENSE_GROUP,
  EXPENSE_GROUPS,
  INCOME_CATEGORIES,
  Transaction,
  TRANSACTION_METHODS,
  TRANSACTION_TYPES
} from '../model/transaction.model';

const PROFESSION = 'Software Developer';
const SECTION_INCOME = 'Income';
const SECTION_EXPENSE = 'Expenses';
const SECTION_STATEMENT = 'Statement';
const SECTION_ASSET = 'Assets';
const SECTION_LIABILITY = 'Liabilities';
const TRANSACTION_PAGE_SIZE = 10;

@Component({
  selector: 'app-finance-personal',
  templateUrl: './finance-personal.component.html'
})
export class FinancePersonalComponent implements OnInit {

  viewingStatementLastMonths: number = 1;

  criteria: string = '';
  transactionIndex: number = 0;
  isSortAscending: boolean = false;
  sortedField: string = this.transactionFields[0];
  editingTransaction: Transaction = {...DEFAULT_TRANSACTION};

  protected readonly SECTION_INCOME = SECTION_INCOME;
  protected readonly SECTION_EXPENSE = SECTION_EXPENSE;
  protected readonly SECTION_STATEMENT = SECTION_STATEMENT;
  protected readonly SECTION_ASSET = SECTION_ASSET;
  protected readonly SECTION_LIABILITY = SECTION_LIABILITY;
  protected readonly EXPENSE_GROUPS = EXPENSE_GROUPS;
  protected readonly TRANSACTION_TYPES = TRANSACTION_TYPES;
  protected readonly TRANSACTION_METHODS = TRANSACTION_METHODS;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchTransactions();
    this.repo.fetchFinancialStatements();
  }

  addTransaction = () => {
    this.editingTransaction = {...DEFAULT_TRANSACTION};
    this.editingTransaction.id = '';
  }

  saveTransaction = () => {
    if (this.editingTransaction.amount <= 0) return;
    if (this.editingTransaction.remark.trim().length < 1) return;

    this.editingTransaction.remark = this.editingTransaction.remark.trim();
    this.repo.saveTransaction(
      this.editingTransaction,
      (saved: Transaction) => this.copyTransaction(saved)
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

  shiftTransactionPage = (length: number) => {
    const ws = TRANSACTION_PAGE_SIZE;
    const maxIndex = this.transactions.length - ws;

    switch (length) {
      case -999:
        this.transactionIndex = 0;
        break;
      case 999:
        this.transactionIndex = maxIndex;
        break;
      case -ws:
        if (this.transactionIndex >= ws) this.transactionIndex -= ws;
        else this.transactionIndex = 0;
        break;
      case ws:
        if (this.transactionIndex < maxIndex - ws) this.transactionIndex += ws;
        else this.transactionIndex = maxIndex;
        break;
    }
  }

  toggleSortable = (field: string) => {
    if (this.sortedField === field) {
      this.isSortAscending = !this.isSortAscending;

    } else {
      this.sortedField = field;
    }
  }

  getExpenses = (group: EXPENSE_GROUP): ExpenseItem[] =>
    this.statement.expenses
      .filter(e => group.categories.includes(e.category))
      .sort((e1, e2) => e2.amount - e1.amount)

  get activeIncomes(): IncomeItem[] {
    return this.statement.incomes
      .filter(i => !i.passive)
      .map(i => ({
        ...i,
        category: i.category.replace('Salary', PROFESSION)
      }));
  }

  get passiveIncomes(): IncomeItem[] {
    return this.statement.incomes.filter(i => i.passive);
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

  get paginationControls(): Array<{ control: string, length: number }> {
    return [
      {control: 'First', length: -999},
      {control: 'Prev', length: -TRANSACTION_PAGE_SIZE},
      {control: 'Next', length: TRANSACTION_PAGE_SIZE},
      {control: 'Last', length: 999},
    ];
  }

  get windowTransactions(): Transaction[] {
    return this.transactions
      .slice(this.transactionIndex, this.transactionIndex + TRANSACTION_PAGE_SIZE);
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
      if (this.sortedField === 'Method') {
        return this.isSortAscending
          ? t1.method.localeCompare(t2.method)
          : t2.method.localeCompare(t1.method)
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

    const criteria = this.criteria.trim().toUpperCase();

    return this.repo.findTransactions()
      .filter(t => {
        if (criteria.length < 1) return t;
        return t.remark.toUpperCase().includes(criteria)
          || t.amount.toString().includes(criteria);
      })
      .sort((t1, t2) => sorter(t1, t2));
  }

  get statementLastMonthsOptions(): number[] {
    return this.repo.findFinancialStatements().map(s => s.lastMonths);
  }

  get statement(): FinancialStatement {
    // @ts-ignore
    return this.repo.findFinancialStatements()
      .find(s => s.lastMonths === this.viewingStatementLastMonths);
  }

  get isLoading(): boolean {
    return this.repo.findTransactions().length === 0
      || this.repo.findFinancialStatements().length === 0;
  }
}
