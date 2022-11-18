import {Component, OnInit} from '@angular/core';

import {JOCKEYS, TRAINERS, NEW_PEOPLE, GONE_PEOPLE, Person} from '../model/person.model';
import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html'
})
export class PeopleComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  getWinners(person: Person): number {
    const stat = this.repo.findStatistics()
      .filter(s => s.person === person.code)
      .pop();

    if (!stat) return 0;
    return stat.seasonWins + stat.careerWins;
  }

  isHighlightWinners(wins: number): boolean {
    return Math.abs(50 - wins % 50) <= 5;
  }

  isLeavingPlayer(person: Person): boolean {
    return GONE_PEOPLE.includes(person)
  }

  isNewPlayer(person: Person): boolean {
    return NEW_PEOPLE.includes(person)
  }

  isBoundaryPerson(person: Person): boolean {
    return ['MA', 'HEL'].includes(person.code);
  }

  get attributes(): string[] {
    return ['Code', 'Last', 'First', 'Nick', 'NAT.', 'WINS']
  }

  get personsList(): Person[][] {
    const sortedTrainers = TRAINERS
      .map(t => t)
      .sort((t1, t2) => t1.nationality.localeCompare(t2.nationality))

    let hkTrainers = sortedTrainers.filter(t => t.nationality == 'HK')
    let nonHKTrainers = sortedTrainers.filter(t => t.nationality !== 'HK')
    const trainers = nonHKTrainers.concat(hkTrainers)

    const sortedJockeys = JOCKEYS
      .map(j => j)
      .sort((j1, j2) => j1.licence.localeCompare(j2.licence))
      .sort((j1, j2) => j1.nationality.localeCompare(j2.nationality))

    let hkJockeys = sortedJockeys.filter(j => j.nationality == 'HK')
    let nonHKJockeys = sortedJockeys.filter(j => j.nationality !== 'HK')
    const jockeys = nonHKJockeys.concat(hkJockeys)

    return [trainers, jockeys]
  }

}