import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Meeting} from './meeting.model';
import {SeasonEarning} from './earning.model';
import {Statistics} from './statistics.model';
import {FinalPool} from './pool.model';
import {FinalDividend} from './dividend.model';

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

  getFinalPools(): Observable<FinalPool[]> {
    return this.http.get<FinalPool[]>(`${this.baseUrl}/pool/finals`);
  }

  getFinalDividends(): Observable<FinalDividend[]> {
    return this.http.get<FinalDividend[]>(`${this.baseUrl}/pool/dividends`);
  }

}