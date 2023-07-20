import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Horse} from './horse.model';
import {Meeting} from './meeting.model';
import {FavoritePost} from './favorite.model';
import {Collaboration} from './collaboration.model';
import {TesterYield} from './backtest.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/${env.API_PREFIX}`;
  }

  saveFavorite = (favorite: FavoritePost): Observable<FavoritePost> =>
    this.http.post<FavoritePost>(`${this.baseUrl}/favorite`, favorite)

  getYields = (): Observable<TesterYield[]> =>
    this.http.get<TesterYield[]>(`${this.baseUrl}/backtest`)

  getHorses = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses`)

  getMeetings = (): Observable<Meeting[]> =>
    this.http.get<Meeting[]>(`${this.baseUrl}/meetings`)

  getCollaborations = (): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations`)
}