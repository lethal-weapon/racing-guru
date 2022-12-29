import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Meeting} from './meeting.model';
import {SeasonEarning} from './earning.model';
import {Statistics} from './statistics.model';
import {FinalPool, TimeSeriesPool} from './pool.model';
import {FinalDividend} from './dividend.model';
import {RaceHorse} from './racehorse.model';
import {Collaboration} from './collaboration.model';
import {PastStarter} from './starter.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/${env.API_PREFIX}`;
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.baseUrl}/performance/meetings`);
  }

  getEarnings(): Observable<SeasonEarning[]> {
    return this.http.get<SeasonEarning[]>(`${this.baseUrl}/performance/earnings`);
  }

  getStatistics(): Observable<Statistics[]> {
    return this.http.get<Statistics[]>(`${this.baseUrl}/performance/statistics`);
  }

  getCollaborations(): Observable<Collaboration[]> {
    return this.http.get<Collaboration[]>(`${this.baseUrl}/performance/collaborations`);
  }

  getPastStarters(): Observable<PastStarter[]> {
    return this.http.get<PastStarter[]>(`${this.baseUrl}/performance/past-starters`);
  }

  getFinalPools(): Observable<FinalPool[]> {
    return this.http.get<FinalPool[]>(`${this.baseUrl}/pool/finals`);
  }

  getTimeSeriesPools(meeting: string, races: number, points: number[]):
    Observable<TimeSeriesPool[]> {
    const params =
      `meeting=${meeting}&races=${races}&points=${points.join(',')}`;

    return this.http.get<TimeSeriesPool[]>(
      `${this.baseUrl}/pool/time-series?${params}`
    );
  }

  getFinalDividends(): Observable<FinalDividend[]> {
    return this.http.get<FinalDividend[]>(`${this.baseUrl}/pool/dividends`);
  }

  getRacehorses(): Observable<RaceHorse[]> {
    return this.http.get<RaceHorse[]>(`${this.baseUrl}/racehorses`);
  }

}