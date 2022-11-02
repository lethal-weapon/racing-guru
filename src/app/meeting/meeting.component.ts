import {Component, OnInit} from '@angular/core';

import {Meeting} from '../model/meeting.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {MeetingRepository} from '../model/meeting.repository';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html'
})
export class MeetingComponent implements OnInit {

  constructor(private repo: MeetingRepository) {
  }

  ngOnInit(): void {
  }

  isBoundaryPerson(person: string): boolean {
    return ['YPF', 'HDA', 'YCH', 'HL', 'BA', 'LDE', 'BV'].includes(person)
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
    return this.repo.findAll().slice(0, 7)
  }

  get overviews(): string[] {
    return this.meetings
      .map(m => `${m.meeting.replace('2022-', '')} ${m.venue} ${m.races}R $${m.turnover}`)
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