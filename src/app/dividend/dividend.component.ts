import {Component, OnInit} from '@angular/core';

import {JOCKEYS, TRAINERS, GONE_PEOPLE} from '../model/person.model';
import {RestRepository} from '../model/rest.repository';
import {FinalDividend} from '../model/dividend.model';

@Component({
  selector: 'app-dividend',
  templateUrl: './dividend.component.html'
})
export class DividendComponent implements OnInit {
  activePersons: string[] = [];

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  setActivePerson = (clicked: string) => {
    if (this.activePersons.includes(clicked)) {
      this.activePersons = this.activePersons.filter(p => p !== clicked)
    } else {
      this.activePersons.push(clicked)
    }
  }

  getPersonStyle(person: string): string {
    return this.activePersons.includes(person)
      ? 'text-yellow-400 border-yellow-400'
      : 'border-gray-600 hover:border-yellow-400'
  }

  getDividendHeader(d: FinalDividend): string {
    return `
      ${d.meeting} ${d.venue}
      #${d.race === 10 ? 'X' : d.race}
      / @${d.WIN.toFixed(1)}
      / @${Math.round(d.QIN)}
      / @${Math.round(d.TCE).toLocaleString()}
      / @${Math.round(d.QTT).toLocaleString()}
    `
  }

  getPlacingPair(d: FinalDividend, placing: number): string {
    return d.persons
      .filter(p => p.placing === placing)
      .map(p => p.person).join(', ');
  }

  formatPercentage(dividend: number, divisor: number): string {
    if (dividend === 0 || divisor === 0) return '0%'
    return `${(dividend / divisor * 100).toFixed(1)}%`
  }

  get dividends(): FinalDividend[] {
    const allDividends = this.repo.findFinalDividends();
    if (this.activePersons.length === 0) return allDividends.slice(0, 8);

    return allDividends
      .filter(d => this.activePersons
        .every(ap => d.persons
          .filter(p => p.placing <= 4)
          .map(t4 => t4.person).includes(ap)))
  }

  get totalEngagements(): number {
    return this.repo.findFinalDividends()
      .filter(d => this.activePersons
        .every(ap => d.persons.map(p => p.person).includes(ap)))
      .length;
  }

  get personLists(): string[][] {
    return [
      JOCKEYS.filter(j => !GONE_PEOPLE.includes(j)).map(j => j.code),
      TRAINERS.filter(j => !GONE_PEOPLE.includes(j)).map(t => t.code),
    ]
  }

}