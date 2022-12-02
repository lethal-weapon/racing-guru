import {Component, OnInit} from '@angular/core';

import {Meeting} from '../model/meeting.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html'
})
export class MeetingComponent implements OnInit {
  isRefreshButtonEnable: boolean = true;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchMeetings();
  }

  refresh = () => {
    if (this.isRefreshButtonEnable) {
      this.isRefreshButtonEnable = false;
      this.repo.fetchMeetings();
      setTimeout(() => this.isRefreshButtonEnable = true, 10_000);
    }
  }

  isJTBoundaryPerson(person: string): boolean {
    return person === 'RW';
  }

  isBoundaryPerson(person: string): boolean {
    return ['WDJ', 'HDA', 'YCH', 'MNJ', 'LDE', 'CLR'].includes(person)
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

  getValue(person: string, meeting: string, placing: string): string {
    const meetings = this.meetings.filter(m => m.meeting == meeting)
    if (meetings.length === 1) {
      const persons = meetings[0].persons.filter(p => p.person == person)
      if (persons.length === 1) {
        // @ts-ignore
        const value = persons[0][placing]
        if (value == 0 && ['engagements', 'earnings'].includes(placing)) {
          return 'X'
        }
        if (value == 0) {
          return ''
        }
        return value.toString()
      } else {
        if (['engagements', 'earnings'].includes(placing)) {
          return 'X'
        }
      }
    }

    return ''
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings().slice(0, 7);
  }

  get overviews(): Array<{ title: string, link: string }> {
    return this.meetings.map(m => {
        const title = `
          ${m.meeting.replace(/^\d{4}-/g, '')}
          ${m.venue} ${m.races}R $${m.turnover}
        `.trim();

        const date = m.meeting.replace(/-/g, '/');

        const link = `
          https://racing.hkjc.com/racing/information/
          English/Racing/ResultsAll.aspx?RaceDate=${date}
        `.replace(/\s/g, '');

        return {
          title: title,
          link: link
        }
      }
    )
  }

  get persons(): string[] {
    let participants = new Set()
    let people: string[] = []

    for (const m of this.meetings) {
      for (const s of m.persons) {
        participants.add(s.person)
      }
    }

    TRAINERS.filter(p => participants.has(p.code)).forEach(p => people.push(p.code))
    JOCKEYS.filter(p => participants.has(p.code)).forEach(p => people.push(p.code))
    return people
  }

  get placings(): Array<{ placing: string, key: string, color: string }> {
    return [
      {placing: 'W', key: 'wins', color: 'text-red-600'},
      {placing: 'Q', key: 'seconds', color: 'text-green-600'},
      {placing: 'P', key: 'thirds', color: 'text-blue-600'},
      {placing: 'F', key: 'fourths', color: 'text-purple-600'},
      {placing: 'E', key: 'engagements', color: ''},
      {placing: '$', key: 'earnings', color: ''},
    ]
  }

}