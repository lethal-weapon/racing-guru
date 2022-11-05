import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Racecard} from './racecard.model';
import {Meeting} from './meeting.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.API_HOSTNAME}:${env.API_PORT}/${env.API_PREFIX}`;
  }

  getRacecards(): Observable<Racecard[]> {
    return this.http.get<Racecard[]>(`${this.baseUrl}/racecards`);
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.baseUrl}/performance/meetings`);
  }

}