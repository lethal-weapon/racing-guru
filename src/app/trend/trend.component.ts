import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {EarningStarter, Meeting, PersonSummary} from '../model/meeting.model';
import {JOCKEYS, NEW_PEOPLE, TRAINERS} from '../model/person.model';
import {BOUNDARY_PERSONS, COLORS, JOCKEY_CODES} from '../util/strings';
import {MAX_RACE_PER_MEETING, ONE_MINUTE, TEN_SECONDS} from '../util/numbers';
import {DEFAULT_HORSE, Horse} from '../model/horse.model';
import {getPersonSummaryByRace} from '../util/functions';

@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html'
})
export class TrendComponent implements OnInit {
  activeSection: string = this.sections[0];
  activeSubsection: string = this.subsections[0];
  activePersonView: string = this.personViews[1];
  activePerson: string = 'WDJ';
  isRefreshButtonEnable: boolean = true;
  meetingIndex: number = 0;

  protected readonly COLORS = COLORS;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchHorses();
    this.repo.fetchMeetings();
    setInterval(() => this.repo.fetchMeetings(), ONE_MINUTE);
  }

  setActiveSection = (clicked: string) =>
    this.activeSection = clicked

  setActiveSubsection = (clicked: string) =>
    this.activeSubsection = clicked

  setActivePersonView = (clicked: string) =>
    this.activePersonView = clicked

  setActivePerson = (clicked: string) =>
    this.activePerson = this.activePerson == clicked ? '' : clicked

  refresh = () => {
    if (this.isRefreshButtonEnable) {
      this.isRefreshButtonEnable = false;
      this.repo.fetchMeetings();
      setTimeout(() => this.isRefreshButtonEnable = true, TEN_SECONDS);
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

  isNewPlayer = (person: string): boolean =>
    NEW_PEOPLE.map(p => p.code).includes(person)

  getPersonStatByRaceTop4 = (person: string, race: number): number[] => {
    const ps = this.getPersonStatByRace(person, race);
    return [ps.wins, ps.seconds, ps.thirds, ps.fourths];
  }

  getPersonStatByRace = (person: string, race: number): PersonSummary => {
    return getPersonSummaryByRace(
      this.meetings.filter((m, index) => index > 0),
      person,
      race
    )
  }

  getHorse = (code: string): Horse =>
    this.repo.findHorses()
      .find(s => s.code === code) || DEFAULT_HORSE

  getStarterHorse = (starter: EarningStarter): Horse =>
    this.repo.findHorses()
      .find(s => s.code === starter.horse) || DEFAULT_HORSE

  getStarterColor = (starter: EarningStarter): string => {
    const placing = starter?.placing;
    if (placing > 0 && placing < 5) return COLORS[placing - 1];
    return '';
  }

  getStarters = (meeting: Meeting, race: number): EarningStarter[] => {
    return meeting.persons
      .find(p => p.person === this.activePerson)
      ?.starters
      .filter(s => s.race === race) || [];
  }

  getSectionStyle = (section: string): string =>
    [this.activeSection, this.activeSubsection, this.activePersonView].includes(section)
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

  getCellValue = (person: string, meeting: string, key: string): string => {
    const meetings = this.meetings.filter(m => m.meeting == meeting);
    if (meetings.length !== 1) return '';

    const persons = meetings[0].persons.filter(p => p.person == person);
    if (persons.length !== 1) {
      return ['engagements', 'earnings'].includes(key) ? 'X' : '';
    }

    // @ts-ignore
    const value = persons[0][key]
    if (value == 0) {
      return ['engagements', 'earnings'].includes(key) ? 'X' : '';
    }
    return value.toString();
  }

  getNoWinnerStats = (person: string): number[] => {
    let days: number = -1;
    let races: number = 0;

    const winningMeetings = this.meetings
      .filter((m, index) => index > 0)
      .filter(m => {
        const engaged = m.persons.map(p => p.person).includes(person);
        if (!engaged) return false;
        return m.persons.find(p => p.person === person)?.wins || 0 > 0;
      });

    if (winningMeetings.length > 0) {
      const mostRecentOne = winningMeetings.shift();
      // @ts-ignore
      days = this.meetings.filter((m, index) => index > 0).indexOf(mostRecentOne);
    }

    for (let i = 1; i < this.meetings.length; i++) {
      const summary = this.meetings[i].persons.find(p => p.person === person);
      if (!summary) continue;

      if (summary.wins === 0) {
        races += summary.starters.filter(s => s?.winOdds).length;
        continue;
      }

      for (let j = 0; j < summary.starters.length; j++) {
        const sortedStarters = summary.starters
          .filter(s => s?.winOdds)
          .sort((s1, s2) => s2.race - s1.race);

        if (sortedStarters[j]?.placing === 1) break;

        races += 1;
      }

      break;
    }

    return [days, races];
  }

  getOnBoardPersons = (meeting: Meeting): PersonSummary[] => {
    let board: PersonSummary[] = [];
    [TRAINERS, JOCKEYS].forEach((category, index) => {
      meeting.persons
        .filter(p => category.map(p => p.code).includes(p.person))
        .sort((p1, p2) => p2.earnings - p1.earnings)
        .forEach(p => {
          if (board.length < (index + 1) * this.topPlayerSize) {
            board.push(p);
          }
        });
    });
    return board;
  }

  getTurnoverIntensityColor = (meeting: Meeting): string => {
    const avg = this.getAverageTurnoverPerRace(meeting);
    if (avg >= 18.5) return 'bg-blue-600';
    if (avg >= 16.5) return 'bg-green-600';
    return 'bg-red-600';
  }

  getAverageTurnoverPerRace = (meeting: Meeting): number =>
    parseFloat((meeting.turnover / meeting.races).toFixed(1))

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  isBoundaryPerson = (person: string): boolean =>
    BOUNDARY_PERSONS.includes(person)

  isBoundaryMeeting = (meeting: string): boolean =>
    this.meetings
      .map(m => m.meeting.slice(0, 7))
      .filter((prefix, i, array) => array.indexOf(prefix) === i)
      .map(prefix => this.meetings
        .map(m => m.meeting)
        .filter(m => m.startsWith(prefix))
        .sort((m1, m2) => m1.localeCompare(m2))
        .shift()
      )
      .includes(meeting);

  isHorseRetired = (code: string): boolean =>
    this.repo.findHorses().find(h => h.code === code)?.retired || false

  isStillSameStable = (code: string): boolean => {
    const pastStarts =
      (this.repo.findHorses().find(h => h.code === code)?.pastStarters || [])
        .map(ps => ps)
        .sort((ps1, ps2) => ps2.meeting.localeCompare(ps1.meeting));

    if (pastStarts.length === 0) return true;
    return pastStarts[0].trainer === this.activePerson;
  }

  getActivePersonViewByHorse = (retired: boolean = false):
    Array<{ horse: string, starters: EarningStarter[] }> => {

    let view: Array<{ horse: string, starters: EarningStarter[] }> = [];

    this.meetings
      .map(m => m.persons.filter(p => p.person === this.activePerson && p.earnings > 0))
      .reduce((ps1, ps2) => ps1.concat(ps2), [])
      .map(ps => ps.starters)
      .reduce((es1, es2) => es1.concat(es2), [])
      .filter(es => es?.placing >= 1 && es?.placing <= 4)
      .filter(es => retired ? this.isHorseRetired(es.horse) : !this.isHorseRetired(es.horse))
      .filter(es => JOCKEY_CODES.includes(this.activePerson) || this.isStillSameStable(es.horse))
      .forEach(es => {
        const hView = view.find(v => v.horse === es.horse);
        if (!hView) {
          view.push({horse: es.horse, starters: [es]});
        } else {
          view.forEach(v => {
            if (v.horse === es.horse) {
              v.starters.push(es);
            }
          });
        }
      });

    view.forEach(v => v.starters.sort((s1, s2) => s1.placing - s2.placing));

    return view.sort((v1, v2) =>
      (v2.starters.filter(s => s?.placing === 1).length) - (v1.starters.filter(s => s?.placing === 1).length)
      ||
      (v2.starters.filter(s => s?.placing === 2).length) - (v1.starters.filter(s => s?.placing === 2).length)
      ||
      (v2.starters.filter(s => s?.placing === 3).length) - (v1.starters.filter(s => s?.placing === 3).length)
      ||
      (v2.starters.filter(s => s?.placing === 4).length) - (v1.starters.filter(s => s?.placing === 4).length)
      ||
      v2.horse.localeCompare(v1.horse)
    );
  }

  get maxActivePersonHorseTop4Count(): number {
    return [false, true]
      .map(retired => this.getActivePersonViewByHorse(retired)
        .map(v => v.starters.length)
        .sort((h1, h2) => h1 - h2)
        .pop() || 1
      )
      .sort((n1, n2) => n1 - n2)
      .pop() || 1;
  }

  get overviews(): Array<{ title: string, link: string }> {
    return this.windowMeetings.map(m => {
        const title = `
          ${this.formatMeeting(m.meeting)}
          ${m.races}R $${m.turnover}
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

  get activePersonName(): string {
    const person = JOCKEYS.concat(TRAINERS)
      .find(p => p.code === this.activePerson);

    if (!person) return '';
    return `${person.lastName}, ${person.firstName}`;
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

  get topPlayerSize(): number {
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

  get controlStyle(): string {
    return `w-12 cursor-pointer transition hover:text-yellow-400`;
  }

  get personViews(): string[] {
    return ['By Meeting', 'By Horse'];
  }

  get subsections(): string[] {
    return ['Trainers', 'Jockeys'];
  }

  get sections(): string[] {
    return ['Everyone Everything', 'Top Players'];
  }
}