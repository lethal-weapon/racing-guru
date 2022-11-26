import {Component, OnInit} from '@angular/core';

import {Earning, DEFAULT_EARNING} from '../model/earning.model';
import {JOCKEYS, TRAINERS, NEW_PEOPLE} from '../model/person.model';
import {RestRepository} from '../model/rest.repository';

interface EarningTable {
  personType: string,
  personEarnings: EarningPerson[]
}

interface EarningPerson {
  person: string,
  lastSeason: Earning,
  currSeason: Earning
}

@Component({
  selector: 'app-performance',
  templateUrl: './earning.component.html'
})
export class EarningComponent implements OnInit {
  activePerson: string = '';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchEarnings();
  }

  setActivePerson = (selected: string) =>
    this.activePerson = selected

  highlightRichDayPercent(personType: string, value: number): boolean {
    return (personType === 'jockey' && value >= 0.4 && value < 1)
      || (personType === 'trainer' && value >= 0.35 && value < 1)
  }

  highlightEarnDayAvg(personType: string, value: number): boolean {
    return (personType === 'jockey' && value >= 12.5)
      || (personType === 'trainer' && value >= 12)
  }

  redEarnDayAvg(lastValue: number, currValue: number): boolean {
    return lastValue > 0
      && currValue > 0
      && Math.abs(lastValue - currValue) >= 3;
  }

  getLastSeasonRanking(persons: EarningPerson[], index: number): string {
    const copy = persons.map(p => p);
    copy.sort((p1, p2) => p2.lastSeason.totalEarn - p1.lastSeason.totalEarn);

    const rp = copy[index].person || '';
    return NEW_PEOPLE.map(p => p.shortName).includes(rp) ? '' : rp;
  }

  get keys(): string[] {
    const obj = this.earnings[0].personEarnings[0].currSeason;
    return Object.keys(obj)
  }

  get earnings(): EarningTable[] {
    const seasons = this.repo.findEarnings();
    if (seasons.length !== 2) return [];

    const last = seasons[0].earnings;
    const curr = seasons[1].earnings;

    return [TRAINERS, JOCKEYS].map(pt => {
      const pes = pt.map(e => {
        return {
          person: e.shortName,
          lastSeason: last.filter(l => l.person === e.code).pop() || DEFAULT_EARNING,
          currSeason: curr.filter(l => l.person === e.code).pop() || DEFAULT_EARNING
        }
      })
      pes.sort((p1, p2) => p2.currSeason.totalEarn - p1.currSeason.totalEarn);

      return {
        personType: pt === TRAINERS ? 'trainer' : 'jockey',
        personEarnings: pes
      }
    })
  }

}