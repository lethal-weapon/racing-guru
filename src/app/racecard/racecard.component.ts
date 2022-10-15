import {Component, OnInit} from '@angular/core';

import {RacecardRepository} from '../model/racecard.repository';
import {Tip} from '../model/tip.model';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  currentMeeting: string = this.meetings[0]
  isDropdownHover: boolean = false

  activeTrainer: string = ''

  constructor(private repo: RacecardRepository) {
  }

  ngOnInit(): void {
  }

  select(clickedMeeting: string) {
    if (this.currentMeeting !== clickedMeeting) {
      this.currentMeeting = clickedMeeting;
      this.isDropdownHover = false;
    }
  }

  setActiveTrainer(clickedTrainer: string) {
    this.activeTrainer = this.activeTrainer === clickedTrainer
      ? ''
      : clickedTrainer
  }

  hideBottomBorder(jockey: string, race: number): boolean {
    return !(
      race === 5
      || race === 10
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
    return (jockey[0] < 'G' && race % 2 == 0) || (jockey[0] > 'J' && race % 2 == 1)
  }

  rideNextRace(jockey: string, race: number): boolean {
    return race < 10 && this.rideThisRace(jockey, race + 1)
  }

  isBoundaryJockey(jockey: string): boolean {
    return this.meetingBoundaryJockeys.includes(jockey)
  }

  isSpecialRace(race: { race: number, grade: string, distance: number, track: string }): boolean {
    return !(
      race.track === 'Turf'
      && race.grade.startsWith('C')
      && (
        race.grade.endsWith('3')
        || race.grade.endsWith('4')
        || race.grade.endsWith('5')
      )
    )
  }

  getTrainer(jockey: string, race: number): string {
    return [
      'SJJ', 'LFC', 'CAS', 'WDJ', 'YPF', 'LKW', 'FC', 'SCS', 'YTP', 'HDA', 'HAD',
      'SWY', 'TKH', 'MKL', 'YCH', 'NPC', 'RW', 'MA', 'GR', 'CCW', 'TYS', 'HL'
    ][(this.jockeys.indexOf(jockey) * race) % 20 + 1]
  }

  getOrders(tipster: string, race: number): number[] {
    return [2, 3, 4, 5].map(e =>
      Math.floor(((1 + this.tipsters.indexOf(tipster)) * race * 17 * e) % 14) + 1)
  }

  getConfident(tipster: string, race: number): boolean {
    return (tipster.includes('a') && [3, 8].includes(race))
      || (tipster.includes('o') && [1, 5].includes(race))
      || (tipster.includes('t') && [2, 6].includes(race))
      || (tipster.includes('h') && [7, 9].includes(race))
  }

  get meetings(): string[] {
    return [
      'SUN, 2022-10-09, ST, 10 Races, 19 Jockeys, 22 Trainers, 123 Horses',
      'WED, 2022-10-05, HV, 9 Races, 16 Jockeys, 22 Trainers, 93 Horses',
      'SAT, 2022-10-01, ST, 10 Races, 20 Jockeys, 21 Trainers, 115 Horses',
    ]
  }

  get meetingBoundaryJockeys(): string[] {
    return ['BA', 'LDE', 'BV']
  }

  get jockeys(): string[] {
    return [
      'PZ', 'TEK', 'DSS', 'BA', 'CML', 'PMF', 'LDE',
      'MMR', 'FEL', 'CLR', 'BHW', 'BV',
      'CJE', 'CCY', 'YML', 'MHT', 'LHW', 'CHA', 'WJH', 'WCV'
    ]
  }

  get tipsters(): string[] {
    return ['Sam', 'Mark', 'Philip', 'Vincent', 'Post', 'Trackwork', 'BigFont']
  }

  get lastRace(): number {
    return 5
  }

  get currentRace(): number {
    return this.lastRace + 1;
  }

  get races(): { race: number, grade: string, distance: number, track: string }[] {
    return [
      {
        race: 1,
        grade: 'Class 5',
        distance: 1200,
        track: 'Turf',
      },
      {
        race: 2,
        grade: 'Class 4',
        distance: 1400,
        track: 'AWT',
      },
      {
        race: 3,
        grade: 'Group 3',
        distance: 1200,
        track: 'Turf',
      },
      {
        race: 4,
        grade: 'Class 3',
        distance: 1600,
        track: 'AWT',
      },
      {
        race: 5,
        grade: 'Class 5',
        distance: 1800,
        track: 'Turf',
      },
      {
        race: 6,
        grade: 'Class 4',
        distance: 1200,
        track: 'Turf',
      },
      {
        race: 7,
        grade: 'Class 4',
        distance: 2400,
        track: 'Turf',
      },
      {
        race: 8,
        grade: 'Class 3',
        distance: 1400,
        track: 'Turf',
      },
      {
        race: 9,
        grade: 'Class 4',
        distance: 1000,
        track: 'Turf',
      },
      {
        race: 10,
        grade: 'Class 2',
        distance: 1650,
        track: 'Turf',
      },
    ]
  }

}