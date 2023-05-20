import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Meeting} from './meeting.model';
import {Statistics} from './statistics.model';
import {RaceHorse} from './racehorse.model';
import {Collaboration} from './collaboration.model';
import {Horse} from './horse.model';
import {FavoritePost} from './favorite.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/${env.API_PREFIX}`;
  }

  getHorses(): Observable<Horse[]> {
    return this.http.get<Horse[]>(`${this.baseUrl}/horses`);
  }

  getRacehorses(): Observable<RaceHorse[]> {
    return this.http.get<RaceHorse[]>(`${this.baseUrl}/racehorses`);
  }

  saveFavorite(favorite: FavoritePost): Observable<FavoritePost> {
    return this.http.post<FavoritePost>(`${this.baseUrl}/favorite`, favorite);
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.baseUrl}/performance/meetings`);
  }

  getStatistics(): Observable<Statistics[]> {
    return this.http.get<Statistics[]>(`${this.baseUrl}/performance/statistics`);
  }

  getCollaborations(): Observable<Collaboration[]> {
    return this.http.get<Collaboration[]>(`${this.baseUrl}/performance/collaborations`);
  }
}