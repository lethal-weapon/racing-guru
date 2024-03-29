import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {JOCKEYS, TRAINERS, NEW_PEOPLE, Person} from '../../model/person.model';

@Component({
  selector: 'app-form-people',
  templateUrl: './form-people.component.html'
})
export class FormPeopleComponent implements OnInit {

  protected readonly NEW_PEOPLE = NEW_PEOPLE;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchCollaborations();
  }

  isNationalityBoundaryPerson = (person: Person): boolean =>
    ['WDJ', 'DMK'].includes(person.code);

  isHighlightWinners = (wins: number): boolean => {
    const closeToFifty = Math.abs(50 - wins % 50) <= 5;
    const endWith489 = [4, 8, 9].includes(wins % 10);

    return closeToFifty || endWith489;
  }

  getWinners = (person: Person): number =>
    this.repo.findCollaborations()
      .filter(c => [c.jockey, c.trainer].includes(person.code))
      .map(c => c.wins)
      .reduce((prev, curr) => prev + curr, person.careerWins)

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

  get attributes(): string[] {
    return ['Code', 'Last', 'First', 'Nick', 'NAT.', 'WINS']
  }
}