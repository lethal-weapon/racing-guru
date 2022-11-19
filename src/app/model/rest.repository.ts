import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Meeting} from './meeting.model';
import {SeasonEarning} from './earning.model';
import {Statistics} from './statistics.model';
import {FinalPool} from './pool.model';

@Injectable()
export class RestRepository {
  private meetings: Meeting[] = [];
  private earnings: SeasonEarning[] = [];
  private statistics: Statistics[] = [];
  private finalPools: FinalPool[] = [];

  constructor(private source: RestDataSource) {
    this.fetchMeetings();
    this.fetchEarnings();
    this.fetchStatistics();
    this.fetchFinalPools();
  }

  findFinalPools(): FinalPool[] {
    return this.finalPools;
  }

  findStatistics(): Statistics[] {
    return this.statistics;
  }

  findMeetings(): Meeting[] {
    return this.meetings;
  }

  findEarnings(): SeasonEarning[] {
    return this.earnings;
  }

  fetchFinalPools = () =>
    this.source.getFinalPools().subscribe(data => this.finalPools = data)

  fetchStatistics = () =>
    this.source.getStatistics().subscribe(data => this.statistics = data)

  fetchEarnings = () =>
    this.source.getEarnings().subscribe(data => this.earnings = data)

  fetchMeetings = () => {
    this.source.getMeetings().subscribe(data => {
      if (this.meetings.length !== data.length) this.meetings = data;
      else {
        this.meetings.forEach(om => {
          const nm = data.filter(d => d.meeting === om.meeting).pop();
          if (nm && nm !== om) {
            om.venue = nm.venue;
            om.races = nm.races;
            om.turnover = nm.turnover;
            om.persons = nm.persons;
          }
        })
      }
    });
  }

}