import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Player} from './player.model';
import {Horse} from './horse.model';
import {Racecard} from './racecard.model';
import {Reminder} from './reminder.model';
import {Report} from './report.model';
import {Bet} from './bet.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {DrawInheritance} from './draw.model';
import {Syndicate, SyndicateSnapshot} from './syndicate.model';
import {TrackworkSnapshot} from './trackwork.model';
import {FavoritePost, Interview, SelectionPost} from './dto.model';
import {FactorHit} from './backtest.model';
import {NegativePerformance, SeasonPerformance} from './performance.model';
import {ConnectionDividend, RaceConnection} from './connection.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.NEW_SERVER_PORT}`;
  }

  saveFavorite = (favorite: FavoritePost): Observable<FavoritePost> =>
    this.http.post<FavoritePost>(`${this.baseUrl}/favorite`, favorite)

  saveSelection = (selection: SelectionPost): Observable<SelectionPost> =>
    this.http.post<SelectionPost>(`${this.baseUrl}/selection`, selection)

  saveInterview = (interviews: Interview[]): Observable<Racecard[]> =>
    this.http.post<Racecard[]>(`${this.baseUrl}/racecards/interviews`, interviews)

  savePlayer = (player: Player): Observable<Player> =>
    this.http.post<Player>(`${this.baseUrl}/players`, player)

  savePlayerOrders = (players: Player[]): Observable<Player[]> =>
    this.http.post<Player[]>(`${this.baseUrl}/players/ordering`, players)

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

  getMeetingHorses = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses/latest`)

  getReports = (): Observable<Report[]> =>
    this.http.get<Report[]>(`${this.baseUrl}/reports`)

  getBets = (): Observable<Bet[]> =>
    this.http.get<Bet[]>(`${this.baseUrl}/bets`)

  getMeetings = (): Observable<Meeting[]> =>
    this.http.get<Meeting[]>(`${this.baseUrl}/meetings`)

  getCollaborations = (): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations`)

  getEnginePerformance = (): Observable<SeasonPerformance[]> =>
    this.http.get<SeasonPerformance[]>(`${this.baseUrl}/engine-performance`)

  getNegativeEnginePerformance = (): Observable<NegativePerformance[]> =>
    this.http.get<NegativePerformance[]>(`${this.baseUrl}/engine-performance-negative`)

  getConnections = (meeting: string): Observable<RaceConnection[]> =>
    this.http.get<RaceConnection[]>(`${this.baseUrl}/graph/connections?meeting=${meeting}`)

  getConnectionDividends = (): Observable<ConnectionDividend[]> =>
    this.http.get<ConnectionDividend[]>(`${this.baseUrl}/graph/connections/dividends`)

  getPlayers = (): Observable<Player[]> =>
    this.http.get<Player[]>(`${this.baseUrl}/players`)

  getReminders = (): Observable<Reminder[]> =>
    this.http.get<Reminder[]>(`${this.baseUrl}/reminders`)

  getDrawInheritances = (): Observable<DrawInheritance[]> =>
    this.http.get<DrawInheritance[]>(`${this.baseUrl}/racecards/draw-inheritance`)

  getSyndicates = (): Observable<Syndicate[]> =>
    this.http.get<Syndicate[]>(`${this.baseUrl}/syndicates`)

  getSyndicateSnapshots = (): Observable<SyndicateSnapshot[]> =>
    this.http.get<SyndicateSnapshot[]>(`${this.baseUrl}/syndicates/snapshots`)

  getTrackworkSnapshots = (): Observable<TrackworkSnapshot[]> =>
    this.http.get<TrackworkSnapshot[]>(`${this.baseUrl}/trackworks/snapshots`)
}
