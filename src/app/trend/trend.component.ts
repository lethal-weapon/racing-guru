import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Syndicate} from '../model/syndicate.model';
import {EarningStarter, Meeting, PersonSummary} from '../model/meeting.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {formatOdds} from '../util/functions';
import {BOUNDARY_PERSONS, COLORS, JOCKEY_CODES} from '../util/strings';
import {MAX_RACE_PER_MEETING, ONE_MINUTE, TEN_SECONDS} from '../util/numbers';
import {DEFAULT_HORSE, Horse} from '../model/horse.model';
import {DEFAULT_DIVIDEND, DividendDto} from '../model/dto.model';
import {of} from "rxjs";

@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html'
})
export class TrendComponent implements OnInit {
  activeSection: string = this.sections[0];
  activeSubsection: string = this.subsections[2];
  activePersonView: string = this.personViews[0];
  activeMeeting: string = '';
  activePerson: string = '';
  activeSyndicate: number = 0;
  isRefreshButtonEnable: boolean = true;
  meetingIndex: number = 0;

  protected readonly formatOdds = formatOdds;
  protected readonly COLORS = COLORS;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchHorses();
    this.repo.fetchMeetings();
    this.repo.fetchDividends();
    this.repo.fetchSyndicates();
    setInterval(() => this.repo.fetchMeetings(), ONE_MINUTE);
  }

  setActiveSection = (clicked: string) =>
    this.activeSection = clicked

  setActiveSubsection = (clicked: string) =>
    this.activeSubsection = clicked

  setActivePersonView = (clicked: string) =>
    this.activePersonView = clicked

  setActiveMeeting = (clicked: string) =>
    this.activeMeeting = clicked

  setActivePerson = (clicked: string) =>
    this.activePerson = this.activePerson == clicked ? '' : clicked

  setActiveSyndicate = (clicked: number) =>
    this.activeSyndicate = this.activeSyndicate == clicked ? 0 : clicked

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

  getSyndicateStarters = (meeting: Meeting, race: number): EarningStarter[] => {
    const activeSyndicateHorses = this.repo.findSyndicates()
      .find(s => s.id === this.activeSyndicate)
      ?.horses || [];

    let starters: EarningStarter[] = [];
    meeting.persons
      .map(p => p.starters)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(s => s.race === race)
      .filter(s => activeSyndicateHorses.includes(s.horse))
      .forEach(es => {
        if (!starters.map(s => s.horse).includes(es.horse)) {
          starters.push(es);
        }
      });

    return starters;
  }

  getVariableStarterSyndicateStarters =
    (engagements: string, race: number): EarningStarter[] => {

      if (this.meetings.length === 0) return [];

      const selectedMeeting = this.activeMeeting.length > 0
        ? this.activeMeeting
        : this.meetings[0].meeting;

      const syndicateHorses = this.repo.findSyndicates()
        .filter(s => this.getSyndicateActiveHorseCount(s.horses) > 1)
        .filter(s => {
          const e = this.getSyndicateCellValue(s, selectedMeeting, 'engagements');
          if (e.length === 0) return false;
          if (engagements === 'OTHERS') return true;

          return engagements === 'SINGLE' ? parseInt(e) === 1 : parseInt(e) > 1;
        })
        .map(s => s.horses)
        .reduce((prev, curr) => prev.concat(curr), []);

      const targetHorses = engagements !== 'OTHERS'
        ? syndicateHorses
        : this.repo.findHorses()
          .map(h => h.code)
          .filter(c => !syndicateHorses.includes(c));

      let starters: EarningStarter[] = [];
      this.meetings
        .find(m => m.meeting === selectedMeeting)
        ?.persons
        .map(p => p.starters)
        .reduce((prev, curr) => prev.concat(curr), [])
        .filter(s => s.race === race)
        .filter(s => targetHorses.includes(s.horse))
        .forEach(es => {
          if (!starters.map(s => s.horse).includes(es.horse)) {
            starters.push(es);
          }
        });

      return starters;
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

  getSyndicateCellValue = (syn: Syndicate, meeting: string, key: string): string => {
    const meetings = this.meetings.filter(m => m.meeting == meeting);
    if (meetings.length !== 1) return '';

    let starters: EarningStarter[] = [];
    meetings[0]
      .persons
      .map(p => p.starters)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(s => syn.horses.includes(s.horse))
      .forEach(es => {
        if (!starters.map(s => s.horse).includes(es.horse)) {
          starters.push(es);
        }
      });

    if (starters.length === 0) return '';

    let value: number = 0;
    switch (key) {
      case 'wins':
        value = starters.filter(s => s?.placing === 1).length;
        break;
      case 'seconds':
        value = starters.filter(s => s?.placing === 2).length;
        break;
      case 'thirds':
        value = starters.filter(s => s?.placing === 3).length;
        break;
      case 'fourths':
        value = starters.filter(s => s?.placing === 4).length;
        break;
      case 'engagements':
        value = starters.length;
        break;
      case 'earnings':
        value = starters
          .map(s => {
            if (s?.placing === 1) return s?.winOdds || 0;
            else if (s?.placing === 2) return (s?.winOdds || 0) / 3;
            else if (s?.placing === 3) return (s?.winOdds || 0) / 4;
            else if (s?.placing === 4) return (s?.winOdds || 0) / 10;
            else return 0;
          })
          .reduce((prev, curr) => prev + curr, 0);
        break;
    }

    if (key === 'earnings') {
      if (value === 0) return 'X';
      return value.toFixed(1);
    }

    if (value === 0) return '';
    return value.toString();
  }

  getNoWinnerStats = (person: string): number[] => {
    let days: number = -1;
    let starts: number = 0;
    let gaps: number[] = [];
    let mostRecentWinningMeeting: string = '';

    const winningMeetings = this.meetings
      .filter((m, index) => index > 0)
      .filter(m => {
        const engaged = m.persons.map(p => p.person).includes(person);
        if (!engaged) return false;
        return m.persons.find(p => p.person === person)?.wins || 0 > 0;
      });

    if (winningMeetings.length > 0) {
      const mostRecentOne = winningMeetings.shift();
      mostRecentWinningMeeting = mostRecentOne?.meeting || '';

      // @ts-ignore
      days = this.meetings.filter((m, index) => index > 0).indexOf(mostRecentOne);
    }

    for (let i = 1; i < this.meetings.length; i++) {
      const summary = this.meetings[i].persons.find(p => p.person === person);
      if (!summary) continue;

      if (summary.wins === 0) {
        starts += summary.starters.filter(s => s?.winOdds).length;
        continue;
      }

      const sortedStarters = summary.starters
        .filter(s => s?.winOdds)
        .sort((s1, s2) => s2.race - s1.race);

      for (let j = 0; j < sortedStarters.length; j++) {
        if (sortedStarters[j]?.placing === 1) break;
        starts += 1;
      }

      break;
    }

    const sortedMeetings = this.meetings
      .filter((m, index) => index > 0)
      .filter(m => m.persons.map(p => p.person).includes(person))
      .sort((m1, m2) => m1.meeting.localeCompare(m2.meeting));

    let gap: number = 0;
    for (let i = 0; i < sortedMeetings.length; i++) {
      const summary = sortedMeetings[i].persons.find(p => p.person === person);
      if (!summary) continue;

      if (summary.wins === 0) {
        gap += summary.starters.filter(s => s?.winOdds).length;
        continue;
      }

      const sortedStarters = summary.starters
        .filter(s => s?.winOdds)
        .sort((s1, s2) => s1.race - s2.race);

      for (let j = 0; j < sortedStarters.length; j++) {
        if (sortedStarters[j]?.placing === 1) {
          gaps.push(gap);
          gap = 0;
        } else {
          gap += 1;
        }
      }

      if (mostRecentWinningMeeting === sortedMeetings[i].meeting) {
        break;
      }
    }

    if (gaps.length === 0) gaps.push(gap);
    const avgStartsPerWinner = gaps.length > 0
      ? Math.floor(gaps.reduce((g1, g2) => g1 + g2, 0) / gaps.length)
      : 0;

    return [days, starts, avgStartsPerWinner];
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

  isOnMostRecentRacecard = (code: string): boolean => {
    if (this.meetings.length < 1) return false;
    return this.meetings[0]
      .persons
      .map(p => p.starters)
      .reduce((prev, curr) => prev.concat(curr), [])
      .map(s => s.horse)
      .includes(code);
  }

  isRaceFinished = (race: number): boolean => {
    const selectedMeeting = this.activeMeeting.length > 0
      ? this.activeMeeting
      : this.meetings[0].meeting;

    const venue = this.meetings
      .find(m => m.meeting === selectedMeeting)
      ?.venue;

    if (!venue) return false;

    const currTime = new Date().getTime();
    const meetingStartTime = venue === 'HV'
      ? new Date(`${selectedMeeting}T18:45:00+08:00`).getTime()
      : new Date(`${selectedMeeting}T13:00:00+08:00`).getTime();

    const offset = (race - 1) * 1800 * 1000;
    return currTime > meetingStartTime + offset;
  }

  getDividendColor = (meeting: string, race: number): string => {
    let count = 0;
    const dividend = this.getDividend(meeting, race);

    if (dividend.win >= 8) count += 1;
    if (dividend.quinella >= 25) count += 1;
    if (dividend.tierce >= 300) count += 1;
    if (dividend.quartet >= 3000) count += 1;

    if (count < 1) return COLORS[0];
    if (count == 1 && dividend.win >= 8 && dividend.win < 10) return COLORS[0];

    if (count < 3) return COLORS[1];
    return COLORS[2];
  }

  getDividendNumbers = (meeting: string, race: number): number[] => {
    const dividend = this.getDividend(meeting, race);
    return [
      dividend.win,
      dividend.tierce,
      dividend.quinella,
      dividend.quartet
    ];
  }

  getDividend = (meeting: string, race: number): DividendDto =>
    this.repo.findDividends().find(d => d.meeting == meeting && d.race == race) || DEFAULT_DIVIDEND

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

  getSyndicateActiveHorseCount = (horses: string[]): number =>
    this.repo.findHorses()
      .filter(h => horses.includes(h.code))
      .filter(h => !h.retired)
      .length;

  get variableStarterSyndicateKinds(): string[] {
    return ['SINGLE', 'MULTIPLE', 'OTHERS'];
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

  get overviews(): Array<{ title: string, link: string, meeting: string }> {
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

        return {title: title, link: link, meeting: m.meeting}
      }
    )
  }

  get syndicates(): Syndicate[] {
    if (this.meetings.length === 0) return [];
    const selectedMeeting = this.activeMeeting.length > 0
      ? this.activeMeeting
      : this.meetings[0].meeting;

    return this.repo.findSyndicates()
      .filter(s => this.getSyndicateActiveHorseCount(s.horses) > 1)
      .filter(s => this.getSyndicateCellValue(s, selectedMeeting, 'engagements').length > 0)
      .sort((s1, s2) =>
        (
          this.getSyndicateCellValue(s2, selectedMeeting, 'engagements').localeCompare(
            this.getSyndicateCellValue(s1, selectedMeeting, 'engagements')
          )
        )
        ||
        (
          this.getSyndicateActiveHorseCount(s2.horses) -
          this.getSyndicateActiveHorseCount(s1.horses)
        )
        ||
        s2.members.length - s1.members.length
        ||
        s1.id - s2.id
      );
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
    return 7;
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
    return ['Trainers', 'Jockeys', 'Syndicates'];
  }

  get sections(): string[] {
    return ['Everyone Everything', 'Top Players'];
  }
}