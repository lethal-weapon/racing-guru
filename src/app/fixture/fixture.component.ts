import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Fixture} from '../model/fixture.model';
import {PAYDAY_MEETING_INTERVAL} from '../util/numbers';

export interface MeetingItem {
  meeting: string,
  venue: string,
  hour: string,
  day: number,
  special: boolean,
  description: string
}

interface MonthlySummary {
  month: string,
  meetings: MeetingItem[]
}

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html'
})
export class FixtureComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchFixtures();
  }

  isPayday = (meeting: string): boolean =>
    this.getSeasonOrder(meeting) % PAYDAY_MEETING_INTERVAL === 0

  isUpcomingMeeting = (meeting: string): boolean =>
    meeting === (
      this.fixture.meetings
        .map(m => m.meeting)
        .filter(m => new Date(m) >= new Date())
        .sort((m1, m2) => m1.localeCompare(m2))
        .shift() || ''
    )

  getTableCellStyle = (meeting: string): string =>
    this.isUpcomingMeeting(meeting)
      ? `border-2 border-gray-900 border-b-yellow-400`
      : ``

  getSeasonOrder = (meeting: string): number =>
    1 + this.fixture.meetings
      .map(m => m.meeting)
      .sort((m1, m2) => m1.localeCompare(m2))
      .indexOf(meeting)

  get monthlySummaries(): MonthlySummary[] {
    return this.fixture.meetings
      .map(r => r.meeting.slice(0, 7))
      .filter((m, index, arr) => index === arr.indexOf(m))
      .sort((m1, m2) => m1.localeCompare(m2))
      .map(m => {
        const monthMeetings = this.fixture.meetings.filter(r => r.meeting.startsWith(m));
        const monthItems = monthMeetings.map(m => {
          const date = new Date(m.meeting);
          const weekday = date.toLocaleString('en-US', {weekday: 'short'});
          const special =
            (m.venue === 'ST' && m.hour !== 'Day')
            ||
            (m.venue === 'ST' && date.getDay() !== 0)
            ||
            (m.venue === 'HV' && m.hour !== 'Night')
            ||
            (m.venue === 'HV' && date.getDay() !== 3)
          ;

          return {
            meeting: m.meeting,
            venue: m.venue,
            hour: m.hour,
            day: parseInt(m.meeting.slice(8)),
            special: special,
            description: special ? `${m.hour} (${weekday})` : ''
          };
        });

        return {
          month: new Date(monthMeetings[0].meeting)
            .toLocaleString('en-US', {month: 'short'})
            .toUpperCase(),
          meetings: monthItems
        };
      });
  }

  get currentSeasonProgress(): string {
    const completed = this.fixture.meetings
      .filter(m => new Date(m.meeting) <= new Date())
      .length;

    return `${Math.ceil(100 * completed / this.fixture.meetings.length)}%`;
  }

  get fixture(): Fixture {
    return this.repo.findFixtures()[0];
  }

  get isLoading(): boolean {
    return this.repo.findFixtures().length === 0;
  }
}
