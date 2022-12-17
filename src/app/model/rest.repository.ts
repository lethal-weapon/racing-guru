import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Meeting} from './meeting.model';
import {SeasonEarning} from './earning.model';
import {Statistics} from './statistics.model';
import {FinalPool, TimeSeriesPool} from './pool.model';
import {FinalDividend} from './dividend.model';

@Injectable()
export class RestRepository {
  private meetings: Meeting[] = [];
  private earnings: SeasonEarning[] = [];
  private statistics: Statistics[] = [];
  private finalPools: FinalPool[] = [];
  private timeSeriesPools: TimeSeriesPool[] = [];
  private finalDividends: FinalDividend[] = [];

  constructor(private source: RestDataSource) {
  }

  findMeetings = () => this.meetings
  findEarnings = () => this.earnings
  findStatistics = () => this.statistics
  findFinalPools = () => this.finalPools
  findTimeSeriesPools = () => this.timeSeriesPools
  findFinalDividends = () => this.finalDividends

  fetchFinalDividends = () =>
    this.source.getFinalDividends().subscribe(data => this.finalDividends = data)

  fetchFinalPools = () =>
    this.source.getFinalPools().subscribe(data => this.finalPools = data)

  fetchTimeSeriesPools = (meeting: string, races: number, points: number[]) => {
    const currTime = new Date().getTime();
    const raceTime = new Date(meeting).getTime();
    const diff = Math.floor((currTime - raceTime) / 1000);
    const fetched = this.timeSeriesPools
      .filter(p => p.meeting === meeting && p.race === races)
      .length > 0;
    if (fetched && diff > 86400) return

    this.source.getTimeSeriesPools(meeting, races, points).subscribe(data => {
      data.forEach(d => {
        const old = this.timeSeriesPools
          .filter(p => p.meeting === d.meeting && p.race === d.race)
          .pop();

        this.timeSeriesPools = this.timeSeriesPools.filter(p => p !== old);
        this.timeSeriesPools.push(d);
      })
    })
  }

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