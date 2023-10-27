import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Note} from './note.model';
import {Horse} from './horse.model';
import {Syndicate, SyndicatePerformance} from './syndicate.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {Racecard} from './racecard.model';
import {FactorHit} from './backtest.model';
import {Report} from './report.model';
import {Record} from './record.model';
import {SeasonPerformance} from './performance.model';
import {
  DividendDto,
  FavoritePost,
  Interview,
  SelectionPost
} from './dto.model';

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

  saveNote = (note: Note): Observable<Note> =>
    this.http.post<Note>(`${this.baseUrl}/note`, note)

  saveSyndicate = (syndicate: Syndicate): Observable<Syndicate> =>
    this.http.post<Syndicate>(`${this.baseUrl}/syndicates`, syndicate)

  deleteSyndicate = (syndicate: Syndicate): Observable<any> =>
    this.http.delete(`${this.baseUrl}/syndicates/${syndicate.id}`)

  getBacktestFactorHits = (factorCombinations: string[][]): Observable<FactorHit[]> =>
    this.http.post<FactorHit[]>(`${this.baseUrl}/backtest`, factorCombinations)

  getRacecards = (meeting: string): Observable<Racecard[]> =>
    this.http.get<Racecard[]>(`${this.baseUrl}/racecards?meeting=${meeting}`)

  getHorses = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses`)

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

  getNotes = (): Observable<Note[]> =>
    this.http.get<Note[]>(`${this.baseUrl}/notes`)

  getSyndicates = (): Observable<Syndicate[]> =>
    this.http.get<Syndicate[]>(`${this.baseUrl}/syndicates`)

  getDividends = (): Observable<DividendDto[]> =>
    this.http.get<DividendDto[]>(`${this.baseUrl}/dividends`)

  getSyndicatePerformance = (): Observable<SyndicatePerformance[]> =>
    this.http.get<SyndicatePerformance[]>(`${this.baseUrl}/syndicate-performance`)

}