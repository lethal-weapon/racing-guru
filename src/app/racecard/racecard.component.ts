import {Component, OnInit} from '@angular/core';

import {RacecardRepository} from '../model/racecard.repository';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  currentMeeting: string = this.meetings[0]
  isDropdownHover: boolean = false

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

  get meetings(): string[] {
    return [
      'SUN, 2022-10-09, ST, 10 Races, 19 Jockeys, 22 Trainers, 123 Horses',
      'WED, 2022-10-05, HV, 9 Races, 16 Jockeys, 22 Trainers, 93 Horses',
      'SAT, 2022-10-01, ST, 10 Races, 20 Jockeys, 21 Trainers, 115 Horses',
    ]
  }

  get jockeys(): string[] {
    return [
      'PZ', 'TEK', 'DSS', 'BA', 'HCY', 'CML', 'PMF', 'LDE',
      'MMR', 'FEL', 'HEL', 'CLR', 'BHW', 'HAA', 'BV',
      'CJE', 'CCY', 'YML', 'MHT', 'LHW',
    ]
  }

  get races(): {raceNum: number, raceClass: string, distance:number, track: string}[] {
    return [
      {
        raceNum: 1,
        raceClass: 'Class 5',
        distance: 1200,
        track: 'Turf',
      },
      {
        raceNum: 2,
        raceClass: 'Class 4',
        distance: 1400,
        track: 'AWT',
      },
      {
        raceNum: 3,
        raceClass: 'Group 3',
        distance: 1200,
        track: 'Turf',
      },
      {
        raceNum: 4,
        raceClass: 'Class 3',
        distance: 1600,
        track: 'AWT',
      },
      {
        raceNum: 5,
        raceClass: 'Class 5',
        distance: 1800,
        track: 'Turf',
      },
      {
        raceNum: 6,
        raceClass: 'Class 4',
        distance: 1200,
        track: 'Turf',
      },
      {
        raceNum: 7,
        raceClass: 'Class 4',
        distance: 2400,
        track: 'Turf',
      },
      {
        raceNum: 8,
        raceClass: 'Class 3',
        distance: 1400,
        track: 'Turf',
      },
      {
        raceNum: 9,
        raceClass: 'Class 4',
        distance: 1000,
        track: 'Turf',
      },
      {
        raceNum: 10,
        raceClass: 'Class 2',
        distance: 1650,
        track: 'Turf',
      },
    ]
  }

}