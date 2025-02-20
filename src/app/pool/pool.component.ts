import {Component, Input, OnInit} from '@angular/core';

import {Racecard} from '../model/racecard.model';
import {BOUNDARY_INVESTMENT_POOLS} from '../util/strings';
import {formatRace, toMillion} from '../util/functions';

interface InvestmentPool {
  race: number,
  pool: string,
  amount: string
}

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html'
})
export class PoolComponent implements OnInit {

  @Input() racecards!: Racecard[];

  protected readonly BOUNDARY_INVESTMENT_POOLS = BOUNDARY_INVESTMENT_POOLS;
  protected readonly formatRace = formatRace;

  constructor() {
  }

  ngOnInit(): void {
  }

  getStarterCount = (race: number): number =>
    (this.racecards.find(r => r.race === race)?.starters || [])
      .filter(s => !s.scratched).length

  getInvestmentPoolAmount = (race: number, pool: string): string => {
    let amount = this.investmentPools
      .find(i => i.race === race && i.pool === pool)?.amount || '';

    if (amount === '0.00') return '';
    if (amount.startsWith('0.')) {
      amount = amount.replace('0.', ' .');
      if (amount.includes('.0')) {
        amount = amount.replace('.0', '. ');
      }
    }
    if (amount.endsWith('0')) {
      amount = `${amount.slice(0, amount.length - 1)} `;
    }
    return amount;
  }

  get maxRace(): number {
    return this.racecards
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2)
      .pop() || 0;
  }

  get investmentPoolNames(): string[] {
    return this.investmentPools
      .map(p => p.pool)
      .filter((p, index, arr) => index === arr.indexOf(p));
  }

  get investmentPools(): InvestmentPool[] {
    return this.racecards.flatMap(r => {
      const pool = r?.pool;
      return [
        {race: r.race, pool: 'WIN', amount: toMillion(pool?.win || 0)},
        {race: r.race, pool: 'PLA', amount: toMillion(pool?.place || 0)},
        {race: r.race, pool: 'QIN', amount: toMillion(pool?.quinella || 0)},
        {race: r.race, pool: 'QPL', amount: toMillion(pool?.quinellaPlace || 0)},
        {race: r.race, pool: 'FCT', amount: toMillion(pool?.forecast || 0)},
        {race: r.race, pool: 'TRI', amount: toMillion(pool?.trio || 0)},
        {race: r.race, pool: 'TCE', amount: toMillion(pool?.tierce || 0)},
        {race: r.race, pool: 'F-Q', amount: toMillion(pool?.quartet || 0)},
        {race: r.race, pool: 'DBL', amount: toMillion(pool?.doubles || 0)},
        {race: r.race, pool: 'TBL', amount: toMillion(pool?.treble || 0)},
        {race: r.race, pool: '6UP', amount: toMillion(pool?.sixUp || 0)},
        {race: r.race, pool: 'D-T', amount: toMillion(pool?.doubleTrio || 0)},
        {race: r.race, pool: 'T-T', amount: toMillion(pool?.tripleTrio || 0)},
      ];
    });
  }
}
