import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {FinalPool, DEFAULT_FINAL_POOL} from '../model/pool.model';
import {ONE_MILLION} from '../constants/numbers';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html'
})
export class PoolComponent implements OnInit {
  activeSection: string = this.sections[0];
  activeGroup: string = this.poolGroups[0];

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchFinalPools();
  }

  setActiveSectionGroup(clicked: string) {
    if (this.sections.includes(clicked)) this.activeSection = clicked;
    else if (this.poolGroups.includes(clicked)) this.activeGroup = clicked;
  }

  getToggleStyle(sectionGroup: string): string {
    return ![this.activeSection, this.activeGroup].includes(sectionGroup)
      ? 'border border-gray-800 hover:border-gray-600 cursor-pointer'
      : 'font-bold bg-gradient-to-r from-sky-800 to-indigo-800'
  }

  formatGrade(grade: string): string {
    return grade === DEFAULT_FINAL_POOL.grade ? '' : grade;
  }

  formatStarters(starters: number): string {
    return starters === DEFAULT_FINAL_POOL.starters ? '' : `${starters}`;
  }

  formatAmount(amount: number): string {
    if (amount === 0) return '';
    let rounded = (amount / ONE_MILLION).toFixed(2);
    while (rounded.length > 0 && rounded.endsWith('0')) {
      rounded = rounded.slice(0, rounded.length - 1)
    }
    if (rounded.length > 0 && rounded.endsWith('.')) {
      rounded = rounded.slice(0, rounded.length - 1)
    }
    return rounded
  }

  getFinalPool(pools: FinalPool[], meeting: string, race: number): FinalPool {
    return pools
      .filter(p => p.meeting === meeting && p.race === race)
      .pop() || DEFAULT_FINAL_POOL;
  }

  getUniqueMeetings(pools: FinalPool[]): string[] {
    return pools
      .map(p => p.meeting)
      .filter((meeting, i, arr) => arr.indexOf(meeting) === i);
  }

  get finalPoolGroups(): FinalPool[][] {
    const sorted = this.repo
      .findFinalPools()
      .sort((p1, p2) => new Date(p2.meeting).getTime() - new Date(p1.meeting).getTime());

    return [
      sorted.filter(p => p.venue === 'HV'),
      sorted.filter(p => p.venue !== 'HV'),
    ]
  }

  get maxRace(): number {
    return this.repo.findFinalPools()
      .map(p => p.race)
      .sort((r1, r2) => r1 - r2)
      .pop() || 10;
  }

  get sectionGroups(): string[][] {
    return [this.sections, this.poolGroups];
  }

  get poolGroups(): string[] {
    return ['WIN, PLACE & QQP', 'FT, FQ, TCE & DBL'];
  }

  get sections(): string[] {
    return ['Season Pools', 'Time Series'];
  }

}