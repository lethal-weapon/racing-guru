import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Meeting} from './meeting.model';
import {SeasonEarning} from "./earning.model";

@Injectable()
export class RestRepository {
  private meetings: Meeting[] = [];
  private earnings: SeasonEarning[] = [];

  constructor(private source: RestDataSource) {
    this.updateMeetings();
    this.updateEarnings();
  }

  findAllMeetings(): Meeting[] {
    return this.meetings;
  }

  findAllEarnings(): SeasonEarning[] {
    return this.earnings;
  }

  updateEarnings = () =>
    this.source.getEarnings().subscribe(data => this.earnings = data)

  updateMeetings = () => {
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