import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Meeting} from './meeting.model';

@Injectable()
export class MeetingRepository {
  private meetings: Meeting[] = [];

  constructor(private source: RestDataSource) {
    source.getMeetings().subscribe(data => this.meetings = data);
  }

  findAll(): Meeting[] {
    return this.meetings;
  }

}