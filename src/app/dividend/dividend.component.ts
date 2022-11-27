import {Component, OnInit} from '@angular/core';

import {JOCKEYS, TRAINERS, GONE_PEOPLE} from '../model/person.model';
import {RestRepository} from '../model/rest.repository';
import {FinalDividend} from '../model/dividend.model';
import {
  FIVE_HUNDRED, FIVE_THOUSAND, ONE_THOUSAND,
  TEN_THOUSAND, TWENTY_THOUSAND
} from '../constants/numbers';

@Component({
  selector: 'app-dividend',
  templateUrl: './dividend.component.html'
})
export class DividendComponent implements OnInit {
  activeMode: string = this.viewModes[2];
  activeQTT: number = 0;
  activePersons: string[] = [];

  ordinals: Array<{ ordinal: number, superScript: string, color: string }> = [
    {ordinal: 1, superScript: 'st', color: 'text-red-600'},
    {ordinal: 2, superScript: 'nd', color: 'text-green-600'},
    {ordinal: 3, superScript: 'rd', color: 'text-blue-600'},
    {ordinal: 4, superScript: 'th', color: 'text-purple-600'},
  ]

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchFinalDividends();
  }

  increaseMinQTT = () =>
    this.activeQTT += this.activeQTT < TEN_THOUSAND
      ? FIVE_HUNDRED
      : this.activeQTT < TWENTY_THOUSAND
        ? ONE_THOUSAND
        : FIVE_THOUSAND

  decreaseMinQTT = () => {
    if (this.activeQTT <= FIVE_HUNDRED) {
      this.activeQTT = 0
    } else {
      this.activeQTT -= this.activeQTT <= TEN_THOUSAND
        ? FIVE_HUNDRED
        : this.activeQTT <= TWENTY_THOUSAND
          ? ONE_THOUSAND
          : FIVE_THOUSAND
    }
  }

  setActiveQuartet = (multiplier: number) =>
    this.activeQTT = multiplier

  setActiveMode = (clicked: string) => {
    if (this.activeMode !== clicked) {
      const modeIndex = this.viewModes.indexOf(clicked)
      const persons = this.activePersons.length
      if (modeIndex >= 2 && persons >= 2) {
        this.activePersons = this.activePersons
          .filter((p, i) => i < modeIndex - 1)
      }

      this.activeMode = clicked
    }
  }

  setActivePerson = (clicked: string) => {
    if (this.activePersons.includes(clicked)) {
      this.activePersons = this.activePersons.filter(p => p !== clicked)
    } else {
      const modeIndex = this.viewModes.indexOf(this.activeMode)
      if (modeIndex < 2) {
        this.activePersons.push(clicked)
      } else if (modeIndex === 2) {
        this.activePersons = [clicked]
      } else if (modeIndex === 3) {
        if (this.activePersons.length < 2) this.activePersons.push(clicked)
        else this.activePersons.splice(1, 1, clicked)
      }
    }
  }

  getModeStyle(mode: string): string {
    return this.activeMode === mode
      ? this.activeStyle
      : this.inactiveStyle
  }

  getBadgeStyle(persons: string | string[]): string {
    const involved = (typeof persons) === 'string' ? [persons] : persons

    // @ts-ignore
    return involved?.some(p => this.activePersons.includes(p))
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

  get freeModeEngagements(): number {
    return this.dividends
      .filter(d => this.activePersons
        .every(ap => d.persons.map(p => p.person).includes(ap)))
      .length;
  }

  get freeModeDividends(): FinalDividend[] {
    if (this.activePersons.length === 0) {
      return this.dividends.slice(0, 10);
    }

    return this.dividends
      .filter(d => this.activePersons
        .every(ap => d.persons
          .filter(p => p.placing <= 4)
          .map(t4 => t4.person)
          .includes(ap)))
  }

  get singleModeDividends():
    Array<Array<{ person: string, top4s: number, engagements: number, percent: string }>> {

    return this.personLists.map(pl => pl.map(p => {
        const engaged = this.dividends
          .filter(d => d.persons.map(p => p.person).includes(p));

        const top4s = this.dividends
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
      }).sort((e1, e2) =>
        (e2.top4s / (e2.engagements == 0 ? -1 : e2.engagements)) -
        (e1.top4s / (e1.engagements == 0 ? -1 : e1.engagements)))
    )
  }

  get doubleModeDividends():
    Array<{ persons: string[], top4s: number, engagements: number, percent: string }> {

    let pairs: { persons: string[]; top4s: number; engagements: number; percent: string; }[] = []
    const target = this.activePersons[0] || undefined
    const people = this.personLists
      .reduce((prev, curr) => prev.concat(curr), [])

    const limit = target ? 20 : 40
    const minTop4 = target ? 4 : 8

    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const pair = [people[i], people[j]]
        if (target && !pair.includes(target)) continue

        const top4s = this.dividends
          .filter(d => pair
            .every(sp => d.persons
              .filter(p => p.placing <= 4).map(t4 => t4.person).includes(sp))).length;
        if (top4s < minTop4) continue

        const engaged = this.dividends
          .filter(d => pair.every(sp => d.persons.map(p => p.person).includes(sp))).length;

        pairs.push({
          persons: pair,
          top4s: top4s,
          engagements: engaged,
          percent: this.formatPercentage(top4s, engaged)
        })
      }
    }

    return pairs.sort((e1, e2) =>
      (e2.top4s / (e2.engagements == 0 ? -1 : e2.engagements)) -
      (e1.top4s / (e1.engagements == 0 ? -1 : e1.engagements))).slice(0, limit);
  }

  get tripleModeDividends():
    Array<{ persons: string[], top4s: number, engagements: number, percent: string }> {

    let trios: { persons: string[]; top4s: number; engagements: number; percent: string; }[] = []
    // const MIN_TOP4 = 8
    // const MIN_RATIO = 0.15
    // const people = this.personLists
    //   .reduce((prev, curr) => prev.concat(curr), [])
    //
    // for (let i = 0; i < people.length; i++) {
    //   for (let j = i + 1; j < people.length; j++) {
    //     for (let k = j + 1; k < people.length; k++) {
    //       const trio = [people[i], people[j], people[k]]
    //       const top4s = this.dividends
    //         .filter(d => trio
    //           .every(sp => d.persons
    //             .filter(p => p.placing <= 4).map(t4 => t4.person).includes(sp)));
    //
    //       const top4Count = top4s.length
    //       if (top4Count < MIN_TOP4) continue
    //
    //       const engaged = this.dividends
    //         .filter(d => trio.every(sp => d.persons.map(p => p.person).includes(sp)));
    //
    //       const engagedCount = engaged.length
    //       if (top4Count / engagedCount < MIN_RATIO) continue
    //
    //       trios.push({
    //         persons: trio,
    //         top4s: top4Count,
    //         engagements: engagedCount,
    //         percent: this.formatPercentage(top4Count, engagedCount)
    //       })
    //     }
    //   }
    // }

    return trios.sort((e1, e2) =>
      (e2.top4s / (e2.engagements == 0 ? -1 : e2.engagements)) -
      (e1.top4s / (e1.engagements == 0 ? -1 : e1.engagements)));
  }

  get dividends(): FinalDividend[] {
    return this.repo.findFinalDividends().filter(d => d.QTT >= this.activeQTT);
  }

  get quartetOptions(): Array<{ text: string, multiplier: number }> {
    return [
      {text: '0', multiplier: 0},
      {text: '5K', multiplier: FIVE_THOUSAND},
      {text: '10K', multiplier: TEN_THOUSAND},
    ];
  }

  get personLists(): string[][] {
    return [
      JOCKEYS.filter(j => !GONE_PEOPLE.includes(j)).map(j => j.code),
      TRAINERS.filter(j => !GONE_PEOPLE.includes(j)).map(t => t.code),
    ]
  }

  get viewModes(): string[] {
    return ['Free', 'Single', 'Double', 'Triple']
  }

  get activeStyle(): string {
    return `text-yellow-400 border-yellow-400`
  }

  get inactiveStyle(): string {
    return `border-gray-600 hover:border-yellow-400`
  }

}