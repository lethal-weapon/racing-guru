import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment as env} from '../../environments/environment';
import {Interview} from './interview.model';
import {Pick} from './pick.model';
import {Bet} from './bet.model';
import {Horse} from './horse.model';
import {Player} from './player.model';
import {Report} from './report.model';
import {Reminder} from './reminder.model';
import {Racecard} from './racecard.model';
import {Syndicate, SyndicateSnapshot} from './syndicate.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {DrawInheritance} from './draw.model';
import {TrackworkSnapshot} from './trackwork.model';
import {BlacklistConnection} from './connection.model';
import {FactorHit} from './backtest.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.NEW_SERVER_PORT}`;
  }

  getPick = (): Observable<Pick> =>
    this.http.get<Pick>(`${this.baseUrl}/picks`)

  savePick = (newPick: Pick): Observable<Pick> =>
    this.http.post<Pick>(`${this.baseUrl}/picks`, newPick)

  getBets = (): Observable<Bet[]> =>
    this.http.get<Bet[]>(`${this.baseUrl}/bets`)

  getHorses = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses`)

  getMeetingHorses = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses/latest`)

  getPlayers = (): Observable<Player[]> =>
    this.http.get<Player[]>(`${this.baseUrl}/players`)

  getActivePlayers = (): Observable<Player[]> =>
    this.http.get<Player[]>(`${this.baseUrl}/players/active`)

  savePlayer = (player: Player): Observable<Player> =>
    this.http.post<Player>(`${this.baseUrl}/players`, player)

  savePlayerOrders = (players: Player[]): Observable<Player[]> =>
    this.http.post<Player[]>(`${this.baseUrl}/players/ordering`, players)

  getReports = (): Observable<Report[]> =>
    this.http.get<Report[]>(`${this.baseUrl}/reports`)

  getReminders = (): Observable<Reminder[]> =>
    this.http.get<Reminder[]>(`${this.baseUrl}/reminders`)

  saveInterview = (interviews: Interview[]): Observable<Racecard[]> =>
    this.http.post<Racecard[]>(`${this.baseUrl}/racecards/interviews`, interviews)

  getRacecards = (meeting: string): Observable<Racecard[]> =>
    this.http.get<Racecard[]>(`${this.baseUrl}/racecards?meeting=${meeting}`)

  getSyndicates = (): Observable<Syndicate[]> =>
    this.http.get<Syndicate[]>(`${this.baseUrl}/syndicates`)

  saveSyndicate = (syndicate: Syndicate): Observable<Syndicate> =>
    this.http.post<Syndicate>(`${this.baseUrl}/syndicates`, syndicate)

  deleteSyndicate = (syndicate: Syndicate): Observable<any> =>
    this.http.delete(`${this.baseUrl}/syndicates/${syndicate.id}`)

  getMeetings = (): Observable<Meeting[]> =>
    this.http.get<Meeting[]>(`${this.baseUrl}/meetings`)

  getLatestMeeting = (): Observable<Meeting> =>
    this.http.get<Meeting>(`${this.baseUrl}/meetings/latest`)

  getCollaborations = (): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations`)

  getRecentCollaborations = (): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations/recent`)

  getDrawInheritances = (): Observable<DrawInheritance[]> =>
    this.http.get<DrawInheritance[]>(`${this.baseUrl}/racecards/draw-inheritance`)

  getLatestDrawInheritances = (): Observable<DrawInheritance[]> =>
    this.http.get<DrawInheritance[]>(`${this.baseUrl}/racecards/draw-inheritance/latest`)

  getSyndicateSnapshots = (): Observable<SyndicateSnapshot[]> =>
    this.http.get<SyndicateSnapshot[]>(`${this.baseUrl}/syndicates/snapshots`)

  getLatestSyndicateSnapshot = (): Observable<SyndicateSnapshot> =>
    this.http.get<SyndicateSnapshot>(`${this.baseUrl}/syndicates/snapshot`)

  getTrackworkSnapshots = (): Observable<TrackworkSnapshot[]> =>
    this.http.get<TrackworkSnapshot[]>(`${this.baseUrl}/trackworks/snapshots`)

  getLatestTrackworkSnapshot = (): Observable<TrackworkSnapshot> =>
    this.http.get<TrackworkSnapshot>(`${this.baseUrl}/trackworks/snapshot`)

  getBlacklistConnections = (meeting: string): Observable<BlacklistConnection[]> =>
    this.http.get<BlacklistConnection[]>(`${this.baseUrl}/players/blacklist-connections?meeting=${meeting}`)

  getBacktestFactorHits = (factorCombinations: string[][]): Observable<FactorHit[]> =>
    this.http.post<FactorHit[]>(`${this.baseUrl}/backtest`, factorCombinations)
}
