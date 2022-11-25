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
  activeMode: string = this.viewModes[2];

  ordinals: Array<{ ordinal: number, superScript: string, color: string }> = [
    {ordinal: 1, superScript: 'st', color: 'text-red-600'},
    {ordinal: 2, superScript: 'nd', color: 'text-green-600'},
    {ordinal: 3, superScript: 'rd', color: 'text-blue-600'},
    {ordinal: 4, superScript: 'th', color: 'text-purple-600'},
  ]

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  setActiveMode = (clicked: string) =>
    this.activeMode = clicked

  setActivePerson = (clicked: string) => {
    if (this.activePersons.includes(clicked)) {
      this.activePersons = this.activePersons.filter(p => p !== clicked)
    } else {
      this.activePersons.push(clicked)
    }
  }

  getModeStyle(mode: string): string {
    return this.activeMode === mode
      ? this.activeStyle
      : this.inactiveStyle
  }

  getPersonStyle(person: string): string {
    return this.activePersons.includes(person)
      ? this.activeStyle
      : this.inactiveStyle
  }

  getPairStyle(pair: string[]): string {
    return pair.some(p => this.activePersons.includes(p))
      ? this.activeStyle
      : this.inactiveStyle
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

  getPlacingPair(d: FinalDividend, placing: number): string[] {
    const pair = d.persons
      .filter(p => p.placing === placing)
      .map(p => p.person);

    if (JOCKEYS.map(j => j.code).includes(pair[0])) {
      return pair;
    }
    return [pair[1], pair[0]]
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

  get singleModeDividends():
    Array<Array<{ person: string, top4s: number, engagements: number, percent: string }>> {

    const allDividends = this.repo.findFinalDividends();
    return this.personLists.map(pl => {
      return pl.map(p => {
        const engaged = allDividends
          .filter(d => d.persons.map(p => p.person).includes(p));

        const top4s = allDividends
          .filter(d => d.persons
            .filter(dp => dp.placing <= 4)
            .map(p => p.person)
            .includes(p));

        return {
          person: p,
          top4s: top4s.length,
          engagements: engaged.length,
          percent: this.formatPercentage(top4s.length, engaged.length)
        }
      }).sort((e1, e2) => (e2.top4s / e2.engagements) - (e1.top4s / e1.engagements))
    })
  }

  get doubleModeDividends():
    Array<{ pair: string[], top4s: number, engagements: number, percent: string }> {

    let pairs: { pair: string[]; top4s: number; engagements: number; percent: string; }[] = []
    const MIN_RATIO = 0.1
    const allDividends = this.repo.findFinalDividends();
    const people = this.personLists
      .reduce((prev, curr) => prev.concat(curr), [])

    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const pair = [people[i], people[j]]
        const engaged = allDividends
          .filter(d => pair.every(sp => d.persons.map(p => p.person).includes(sp)));

        const top4s = allDividends
          .filter(d => pair
            .every(sp => d.persons
              .filter(p => p.placing <= 4).map(t4 => t4.person).includes(sp)));

        const engagedCount = engaged.length
        const top4Count = top4s.length

        if (top4Count >= 8 && (top4Count / engagedCount >= MIN_RATIO)) {
          pairs.push({
            pair: pair,
            top4s: top4Count,
            engagements: engagedCount,
            percent: this.formatPercentage(top4Count, engagedCount)
          })
        }
      }
    }

    return pairs.sort((e1, e2) => (e2.top4s / e2.engagements) - (e1.top4s / e1.engagements));
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

  get viewModes(): string[] {
    return ['Plain', 'Single', 'Double', 'Triple']
  }

  get activeStyle(): string {
    return `text-yellow-400 border-yellow-400`
  }

  get inactiveStyle(): string {
    return `border-gray-600 hover:border-yellow-400`
  }

}