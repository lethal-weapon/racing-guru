import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {JOCKEYS, TRAINERS} from '../../model/person.model';

export interface Interview {
  meeting: string,
  race: number,
  order: number,
  interviewee: string
}

const DEFAULT_INTERVIEW: Interview = {
  meeting: '',
  race: 1,
  order: 1,
  interviewee: ''
}

@Component({
  selector: 'app-form-note',
  templateUrl: './form-note.component.html'
})
export class FormNoteComponent implements OnInit {
  activeMeeting: string = '2023-07-16';
  meetingIndex: number = 0;
  interviews: Interview[] = [];

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    // this.repo.fetchHorses();
    // this.repo.fetchMeetings();
    this.addInterview();
    this.addInterview();
    this.addInterview();
    this.addInterview();
    this.addInterview();
  }

  addInterview = () => {
    const largestRace =
      this.interviews.map(i => i.race).sort((r1, r2) => r1 - r2).pop() || 1;

    this.interviews.push({
      ...DEFAULT_INTERVIEW,
      meeting: this.activeMeeting,
      race: largestRace < this.maxRace ? 1 + largestRace : largestRace,
      interviewee: this.persons[0]
    })
  }

  deleteInterview = (interview: Interview) =>
    this.interviews = this.interviews.filter(i => i !== interview);

  saveInterview = () => {
  }

  setActiveMeeting = (meeting: string) => {
    this.activeMeeting = meeting;
  }

  shiftMeeting = (length: number) => {
    const ws = this.windowSize;
    const maxIndex = this.meetings.length - ws;

    switch (length) {
      case -99:
        this.meetingIndex = 0;
        break;
      case 99:
        this.meetingIndex = maxIndex;
        break;
      case -ws:
        if (this.meetingIndex >= ws) this.meetingIndex -= ws;
        else this.meetingIndex = 0;
        break;
      case ws:
        if (this.meetingIndex < maxIndex - ws) this.meetingIndex += ws;
        else this.meetingIndex = maxIndex;
        break;
    }
  }

  getMeetingIndex = (meeting: string): number => {
    for (const season of this.seasons) {
      const opening = season[0]
      const finale = season[1]

      if (meeting >= opening && meeting <= finale) {
        return 1 + this.meetings
          .filter(m => m >= opening && m <= finale)
          .sort((m1, m2) => m1.localeCompare(m2))
          .indexOf(meeting);
      }
    }
    return 0;
  }

  getBadgeStyle = (render: string): string =>
    this.activeMeeting === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400`

  get maxOrder(): number {
    return 14;
  }

  get maxRace(): number {
    return 11;
  }

  get paginationControls(): Array<{ icon: string, length: number }> {
    return [
      {icon: 'fa fa-2x fa-long-arrow-left', length: -99},
      {icon: 'fa fa-2x fa-angle-double-left', length: -this.windowSize},
      {icon: 'fa fa-2x fa-angle-double-right', length: this.windowSize},
      {icon: 'fa fa-2x fa-long-arrow-right', length: 99},
    ]
  }

  get windowMeetings(): string[] {
    return this.meetings.slice(
      this.meetingIndex, this.meetingIndex + this.windowSize
    );
  }

  get windowSize(): number {
    return 15;
  }

  get persons(): string[] {
    return JOCKEYS.concat(TRAINERS).map(p => p.code);
  }

  get seasons(): string[][] {
    return [
      ['2023-09-10', '2024-07-14'],
      ['2022-09-11', '2023-07-16'],
    ]
  }

  get meetings(): string[] {
    return this.repo.findMeetings().map(m => m.meeting);
  }
}