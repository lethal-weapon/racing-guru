import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Horse} from './horse.model';
import {HorseOwner} from './owner.model';
import {Meeting} from './meeting.model';
import {FavoritePost, Interview} from './dto.model';
import {Collaboration} from './collaboration.model';
import {EngineYield, FactorHit, TesterYield} from './backtest.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/${env.API_PREFIX}`;
  }

  saveFavorite = (favorite: FavoritePost): Observable<FavoritePost> =>
    this.http.post<FavoritePost>(`${this.baseUrl}/favorite`, favorite)

  saveInterview = (interviews: Interview[]): Observable<Interview[]> =>
    this.http.post<Interview[]>(`${this.baseUrl}/interviews`, interviews)

  getHorses = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses`)

  getOwners = (): Observable<HorseOwner[]> =>
    this.http.get<HorseOwner[]>(`${this.baseUrl}/owners`)

  getMeetings = (): Observable<Meeting[]> =>
    this.http.get<Meeting[]>(`${this.baseUrl}/meetings`)

  getCollaborations = (): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations`)

  getBacktestAccuracy = (factorCombinations: string[][]): Observable<FactorHit[]> =>
    this.http.post<FactorHit[]>(`${this.baseUrl}/backtest/accuracy`, factorCombinations)

  getBacktestEngines = (): Observable<EngineYield[]> =>
    this.http.get<EngineYield[]>(`${this.baseUrl}/backtest/engines`)

  getBacktestYields = (factors: string[]): Observable<TesterYield[]> =>
    this.http.post<TesterYield[]>(`${this.baseUrl}/backtest/profitability`, factors)

}