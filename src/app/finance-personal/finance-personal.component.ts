import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

const SECTION_INCOME = 'Income';
const SECTION_EXPENSE = 'Expenses';
const SECTION_STATEMENT = 'Statement';
const SECTION_ASSET = 'Assets';
const SECTION_LIABILITY = 'Liabilities';
const REMAINDER_SALARY_TAX_RATE = 0.17;

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

interface SalaryTaxRate {
  range: number,
  rate: number
}

@Component({
  selector: 'app-finance-personal',
  templateUrl: './finance-personal.component.html'
})
export class FinancePersonalComponent implements OnInit {

  protected readonly SECTION_INCOME = SECTION_INCOME;
  protected readonly SECTION_EXPENSE = SECTION_EXPENSE;
  protected readonly SECTION_STATEMENT = SECTION_STATEMENT;
  protected readonly SECTION_ASSET = SECTION_ASSET;
  protected readonly SECTION_LIABILITY = SECTION_LIABILITY;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  computeSalaryTax = (annualTaxableIncome: number): number => {
    let tax = 0;
    let loopIndex = 0;
    let remainingIncome = annualTaxableIncome;

    while (loopIndex < this.salaryTaxRates.length) {
      if (remainingIncome <= 0) return tax;

      const currentRate = this.salaryTaxRates[loopIndex].rate;
      const currentRange = this.salaryTaxRates[loopIndex].range;
      tax += Math.min(remainingIncome, currentRange) * currentRate;

      loopIndex += 1;
      remainingIncome -= currentRange;
    }

    if (remainingIncome > 0) {
      tax += remainingIncome * REMAINDER_SALARY_TAX_RATE;
    }
    return tax;
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
    let annualSalaryTax = this.computeSalaryTax(annualTaxableIncome);

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

  get salaryTaxRates(): SalaryTaxRate[] {
    return [
      {range: 50_000, rate: 0.02},
      {range: 50_000, rate: 0.06},
      {range: 50_000, rate: 0.10},
      {range: 50_000, rate: 0.14},
    ]
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
}
