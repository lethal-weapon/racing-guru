import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {FavoritePost, Interview, SelectionPost} from './dto.model';
import {Horse} from './horse.model';
import {HorseOwner} from './owner.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {Racecard} from './racecard.model';
import {FactorHit} from './backtest.model';
import {Report} from './report.model';
import {Record} from './record.model';
import {SeasonPerformance} from './performance.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/${env.API_PREFIX}`;
  }

  saveFavorite = (favorite: FavoritePost): Observable<FavoritePost> =>
    this.http.post<FavoritePost>(`${this.baseUrl}/favorite`, favorite)

  saveSelection = (selection: SelectionPost): Observable<SelectionPost> =>
    this.http.post<SelectionPost>(`${this.baseUrl}/selection`, selection)

  saveInterview = (interviews: Interview[]): Observable<Racecard[]> =>
    this.http.post<Racecard[]>(`${this.baseUrl}/interviews`, interviews)

  getBacktestFactorHits = (factorCombinations: string[][]): Observable<FactorHit[]> =>
    this.http.post<FactorHit[]>(`${this.baseUrl}/backtest`, factorCombinations)

  getRacecards = (meeting: string): Observable<Racecard[]> =>
    this.http.get<Racecard[]>(`${this.baseUrl}/racecards?meeting=${meeting}`)

  getHorses = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses`)

  getOwners = (): Observable<HorseOwner[]> =>
    this.http.get<HorseOwner[]>(`${this.baseUrl}/owners`)

  getReports = (): Observable<Report[]> =>
    this.http.get<Report[]>(`${this.baseUrl}/reports`)

  getRecords = (): Observable<Record[]> =>
    this.http.get<Record[]>(`${this.baseUrl}/records`)

  getMeetings = (): Observable<Meeting[]> =>
    this.http.get<Meeting[]>(`${this.baseUrl}/meetings`)

  getCollaborations = (): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations`)

  getEnginePerformance = (): Observable<SeasonPerformance[]> =>
    this.http.get<SeasonPerformance[]>(`${this.baseUrl}/engine-performance`)

}