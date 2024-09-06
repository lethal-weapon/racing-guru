export interface SalaryTaxRate {
  range: number,
  rate: number
}

export const REMAINDER_SALARY_TAX_RATE = 0.17;
export const SALARY_TAX_RATES: SalaryTaxRate[] = [
  {range: 50_000, rate: 0.02},
  {range: 50_000, rate: 0.06},
  {range: 50_000, rate: 0.10},
  {range: 50_000, rate: 0.14},
]

export const computeSalaryTax = (annualTaxableSalary: number): number => {
  let tax = 0;
  let loopIndex = 0;
  let remainingIncome = annualTaxableSalary;

  while (loopIndex < SALARY_TAX_RATES.length) {
    if (remainingIncome <= 0) return tax;

    const currentRate = SALARY_TAX_RATES[loopIndex].rate;
    const currentRange = SALARY_TAX_RATES[loopIndex].range;
    tax += Math.min(remainingIncome, currentRange) * currentRate;

    loopIndex += 1;
    remainingIncome -= currentRange;
  }

  if (remainingIncome > 0) {
    tax += remainingIncome * REMAINDER_SALARY_TAX_RATE;
  }
  return tax;
}
