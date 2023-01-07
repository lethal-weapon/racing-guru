import {Component, OnInit} from '@angular/core';

import {Meeting, PersonSummary} from '../model/meeting.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html'
})
export class TrendComponent implements OnInit {
  activeSection: string = this.sections[0];
  activeSubsection: string = this.subsections[0];
  activeVenue: string = '';
  activePerson: string = '';
  isRefreshButtonEnable: boolean = true;

  meetingIndex: number = 0;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchMeetings();
  }

  setActiveSection = (clicked: string) =>
    this.activeSection = clicked

  setActiveSubsection = (clicked: string) =>
    this.activeSubsection = clicked

  setActiveVenue = (clicked: string) =>
    this.activeVenue = this.activeVenue == clicked ? '' : clicked

  setActivePerson = (clicked: string) =>
    this.activePerson = this.activePerson == clicked ? '' : clicked

  refresh = () => {
    if (this.isRefreshButtonEnable) {
      this.isRefreshButtonEnable = false;
      this.repo.fetchMeetings();
      setTimeout(() => this.isRefreshButtonEnable = true, 10_000);
    }
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
      case -1:
        if (this.meetingIndex > 0) this.meetingIndex -= 1;
        break;
      case 1:
        if (this.meetingIndex < maxIndex) this.meetingIndex += 1;
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

  getSectionStyle(section: string): string {
    return [this.activeSection, this.activeSubsection].includes(section)
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;
  }

  getCellValue(person: string, meeting: string, key: string): string {
    const meetings = this.meetings.filter(m => m.meeting == meeting);
    if (meetings.length !== 1) return '';

    const persons = meetings[0].persons.filter(p => p.person == person);
    if (persons.length !== 1) {
      if (['engagements', 'earnings'].includes(key)) return 'X';
      return '';
    }

    // @ts-ignore
    const value = persons[0][key]
    if (value == 0) {
      if (['engagements', 'earnings'].includes(key)) return 'X';
      return '';
    }
    return value.toString();
  }

  getPastRecordUrl(person: string): string {
    let url = `
      https://racing.hkjc.com/racing/information/
      English/Trainers/TrainerPastRec.aspx?TrainerId=${person}
    `.replace(/\s/g, '');

    if (JOCKEYS.map(j => j.code).includes(person)) {
      url = url
        .replace(/Trainer/g, 'Jockey')
        .replace('Jockeys', 'Jockey');
    }

    return url;
  }

  getNoWinnerDays(person: string): number {
    const winningMeetings = this.meetings.filter(m => {
      const engaged = m.persons.map(p => p.person).includes(person);
      if (!engaged) return false;
      return m.persons.filter(p => p.person === person).pop()?.wins || 0 > 0;
    })

    if (winningMeetings.length > 0) {
      const mostRecentOne = winningMeetings.shift();
      // @ts-ignore
      const index = this.meetings.indexOf(mostRecentOne);
      if (!index) return 0;

      const nearestMeeting = this.meetings[0].meeting;
      const raceTime = new Date(nearestMeeting).getTime();
      const currTime = new Date().getTime();
      const diff = Math.floor((currTime - raceTime) / 1000);
      if (diff > 86400) return index;

      return index === 0 ? index : index - 1;
    }

    return 99;
  }

  getOnBoardPersons(meeting: Meeting): PersonSummary[] {
    let board: PersonSummary[] = [];
    [TRAINERS, JOCKEYS].forEach((category, index) => {
      meeting.persons
        .filter(p => category.map(p => p.code).includes(p.person))
        .sort((p1, p2) => p2.earnings - p1.earnings)
        .forEach(p => {
          if (board.length < (index + 1) * this.maxTopPlayers) {
            board.push(p);
          }
        });
    });
    return board;
  }

  getTurnoverIntensityColor(meeting: Meeting): string {
    const avg = this.getAverageTurnoverPerRace(meeting);
    if (avg >= 18.5) return 'bg-blue-600';
    if (avg >= 16.5) return 'bg-green-600';
    return 'bg-red-600';
  }

  getAverageTurnoverPerRace(meeting: Meeting): number {
    return parseFloat(
      (meeting.turnover / meeting.races).toFixed(1)
    );
  }

  isBoundaryPerson(person: string): boolean {
    return ['WDJ', 'YTP', 'TKH', 'BA', 'CCY', 'BV'].includes(person);
  }

  get controlStyle(): string {
    return `w-12 cursor-pointer transition hover:text-yellow-400`;
  }

  get overviews(): Array<{ title: string, link: string }> {
    return this.windowMeetings.map(m => {
        const title = `
          ${m.meeting.replace(/^\d{4}-/g, '')}
          ${m.venue} ${m.races}R $${m.turnover}
        `.trim();

        const date = m.meeting.replace(/-/g, '/');

        const link = `
          https://racing.hkjc.com/racing/information/
          English/Racing/ResultsAll.aspx?RaceDate=${date}
        `.replace(/\s/g, '');

        return {title: title, link: link}
      }
    )
  }

  get persons(): string[] {
    return this.activeSubsection === this.subsections[0]
      ? TRAINERS.map(t => t.code)
      : JOCKEYS.map(j => j.code);
  }

  get placings(): Array<{ placing: string, key: string, color: string, width: string }> {
    return [
      {placing: 'W', key: 'wins', color: 'text-red-600', width: 'w-8'},
      {placing: 'Q', key: 'seconds', color: 'text-green-600', width: 'w-6'},
      {placing: 'P', key: 'thirds', color: 'text-blue-600', width: 'w-6'},
      {placing: 'F', key: 'fourths', color: 'text-purple-600', width: 'w-6'},
      {placing: 'E', key: 'engagements', color: '', width: 'w-8'},
      {placing: '$', key: 'earnings', color: '', width: 'w-12'},
    ]
  }

  get maxTopPlayers(): number {
    return 7;
  }

  get windowSize(): number {
    return 8;
  }

  get windowMeetings(): Meeting[] {
    return this.meetings.slice(
      this.meetingIndex, this.meetingIndex + this.windowSize
    );
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }

  get subsections(): string[] {
    return ['Trainers', 'Jockeys'];
  }

  get sections(): string[] {
    return ['Everyone Everything', 'Top Players'];
  }
}