import {Component, OnInit} from '@angular/core';

import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {RacecardRepository} from '../model/racecard.repository';
import {JOCKEYS, TRAINERS} from '../model/person.model';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  activeTrainer: string = ''

  constructor(private repo: RacecardRepository) {
  }

  ngOnInit(): void {
  }

  setActiveTrainer = (clicked: string) =>
    this.activeTrainer = this.activeTrainer === clicked ? '' : clicked

  getMeetingEarning(jockey: string): number {
    return 0
  }

  getWinOdds(jockey: string, race: number): number {
    return 0;
  }

  getPlaceOdds(jockey: string, race: number): number {
    return 0;
  }

  getTrainer(jockey: string, race: number): string {
    return this.getStarter(jockey, race).trainer;
  }

  getStarter(jockey: string, race: number): Starter {
    // @ts-ignore
    return this.racecards
      .filter(r => r.race == race)
      .pop()
      .starters
      .filter(s => s.jockey === jockey)
      .pop();
  }

  getHorseProfileUrl(horse: string): string {
    return `
        https://racing.hkjc.com/racing/information/
        English/Horse/Horse.aspx?HorseNo=${horse}
    `.replace(/\s/g, '');
  }

  hideBottomBorder(jockey: string, race: number): boolean {
    return !(
      race === this.lastRace
      || race === this.maxRace
      || this.rideThisRace(jockey, race)
      || this.rideNextRace(jockey, race)
    )
  }

  hideRightBorder(jockey: string, race: number): boolean {
    return !(
      jockey === this.jockeys.pop()
      || this.isBoundaryJockey(jockey)
      || this.rideThisRace(jockey, race)
      || this.rideThisRace(this.jockeys[this.jockeys.indexOf(jockey) + 1], race)
    )
  }

  rideThisRace(jockey: string, race: number): boolean {
    // @ts-ignore
    return this.racecards
      .filter(r => r.race == race)
      .pop()
      .starters
      .map(s => s.jockey)
      .includes(jockey);
  }

  rideNextRace(jockey: string, race: number): boolean {
    return race < this.maxRace && this.rideThisRace(jockey, race + 1)
  }

  isFavoured(jockey: string, race: number): boolean {
    return false;
  }

  isSpecialRace(race: Racecard): boolean {
    return !(
      race.track === 'Turf'
      && race.grade.startsWith('C')
      && (!race.name.includes('CUP'))
      && (
        race.grade.endsWith('3')
        || race.grade.endsWith('4')
        || race.grade.endsWith('5')
      )
    )
  }

  isBoundaryJockey(jockey: string): boolean {
    let specials = []
    for (const j of ['BA', 'LDE', 'BV']) {
      if (this.jockeys.includes(j)) {
        specials.push(j);
      } else {
        let priorIndex = JOCKEYS.map(j => j.code).indexOf(j);
        let priorJockey = j;
        while (!this.jockeys.includes(priorJockey) && priorIndex > 0) {
          priorIndex -= 1;
          priorJockey = JOCKEYS[priorIndex].code;
        }
        specials.push(priorJockey);
      }
    }
    return specials.includes(jockey);
  }

  get remainingSeconds(): string {
    if (!this.next) return `0`;

    const raceTime = new Date(this.next.time).getTime();
    const currTime = new Date().getTime();
    const diff = Math.floor((raceTime - currTime) / 1000);

    if (diff > 999) return `999+`
    return `${diff}`
  }

  get maxRace(): number {
    return this.racecards.map(r => r.race).pop() || 0;
  }

  get lastRace(): number {
    return this.nextRace - 1;
  }

  get nextRace(): number {
    return this.next.race || 0;
  }

  get next(): Racecard {
    return this.racecards.filter(r => !r.dividend)[0];
  }

  get racecards(): Racecard[] {
    return this.repo.findAll();
  }

  get starters(): Starter[] {
    return this.racecards
      .map(r => r.starters)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(s => !s.scratched);
  }

  get trainers(): string[] {
    const meetingTrainers = new Set(this.starters.map(s => s.trainer));
    return TRAINERS.map(t => t.code).filter(t => meetingTrainers.has(t));
  }

  get jockeys(): string[] {
    const meetingJockeys = new Set(this.starters.map(s => s.jockey));
    return JOCKEYS.map(j => j.code).filter(j => meetingJockeys.has(j));
  }

  get meetingSummary(): string {
    const racecard = this.racecards.find(r => r.race === 1);
    if (!racecard) return 'Unknown';

    const date = racecard.meeting;
    const venue = racecard.venue;
    const total = this.racecards.length;
    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', {weekday: 'short'})
      .toUpperCase();

    const horses = this.starters.length;
    const jockeys = this.jockeys.length;
    const trainers = this.trainers.length;

    return `
        ${dayOfWeek}, ${date}, ${venue}, ${total} Races, 
        ${jockeys} Jockeys, ${trainers} Trainers, ${horses} Horses
    `;
  }

}