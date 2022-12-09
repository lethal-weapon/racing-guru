import {Component, OnInit} from '@angular/core';

import {Meeting, PersonSummary} from '../model/meeting.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {RestRepository} from '../model/rest.repository';

const MAX_ON_BOARD_PERSON_PER_CATEGORY = 7;

@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html'
})
export class TrendComponent implements OnInit {
  activeVenue: string = '';
  activePerson: string = '';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchMeetings();
  }

  setActiveVenue = (clicked: string) =>
    this.activeVenue = this.activeVenue == clicked ? '' : clicked

  setActivePerson = (clicked: string) =>
    this.activePerson = this.activePerson == clicked ? '' : clicked

  getOnBoardPersons(meeting: Meeting): PersonSummary[] {
    let board: PersonSummary[] = [];
    [TRAINERS, JOCKEYS].forEach((category, index) => {
      meeting.persons
        .filter(p => category.map(p => p.code).includes(p.person))
        .sort((p1, p2) => p2.earnings - p1.earnings)
        .forEach(p => {
          if (board.length < (index + 1) * MAX_ON_BOARD_PERSON_PER_CATEGORY) {
            board.push(p);
          }
        });
    });
    return board;
  }

  getTurnoverIntensityColor(meeting: Meeting): string {
    const avg = this.getAverageTurnoverPerRace(meeting);
    if (avg >= 19.5) return 'bg-blue-600';
    if (avg >= 17.5) return 'bg-green-600';
    return 'bg-red-600';
  }

  getAverageTurnoverPerRace(meeting: Meeting): number {
    return parseFloat(
      (meeting.turnover / meeting.races).toFixed(1)
    );
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }

}