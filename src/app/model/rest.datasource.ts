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
import {Recommendation} from './recommendation.model';
import {Syndicate, SyndicateSnapshot} from './syndicate.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {DrawInheritance} from './draw.model';
import {TrackworkSnapshot} from './trackwork.model';
import {BlacklistConnection} from './connection.model';
import {FactorHit, Factor} from './backtest.model';
import {Fixture} from './fixture.model';

@Injectable()
export class RestDataSource {
  baseUrl: string;
  backtestBaseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}`;

    this.backtestBaseUrl =
      `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.BACKTEST_SERVER_PORT}/backtest`;
  }

  getPick = (): Observable<Pick> =>
    this.http.get<Pick>(`${this.baseUrl}/picks`)

  savePick = (newPick: Pick): Observable<Pick> =>
    this.http.post<Pick>(`${this.baseUrl}/picks`, newPick)

  getBets = (): Observable<Bet[]> =>
    this.http.get<Bet[]>(`${this.baseUrl}/bets`)

  getHorseWithoutStarters = (): Observable<Horse[]> =>
    this.http.get<Horse[]>(`${this.baseUrl}/horses/without-starters`)

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

  getReports = (size: number): Observable<Report[]> =>
    this.http.get<Report[]>(`${this.baseUrl}/reports?size=${size}`)

  getReminders = (size: number): Observable<Reminder[]> =>
    this.http.get<Reminder[]>(`${this.baseUrl}/reminders?size=${size}`)

  saveInterview = (interviews: Interview[]): Observable<Racecard[]> =>
    this.http.post<Racecard[]>(`${this.baseUrl}/racecards/interviews`, interviews)

  getRacecards = (meeting: string): Observable<Racecard[]> =>
    this.http.get<Racecard[]>(`${this.baseUrl}/racecards?meeting=${meeting}`)

  getRecommendations = (size: number): Observable<Recommendation[]> =>
    this.http.get<Recommendation[]>(`${this.baseUrl}/recommendations?size=${size}`)

  getSyndicates = (): Observable<Syndicate[]> =>
    this.http.get<Syndicate[]>(`${this.baseUrl}/syndicates`)

  saveSyndicate = (syndicate: Syndicate): Observable<Syndicate> =>
    this.http.post<Syndicate>(`${this.baseUrl}/syndicates`, syndicate)

  deleteSyndicate = (syndicate: Syndicate): Observable<any> =>
    this.http.delete(`${this.baseUrl}/syndicates/${syndicate.id}`)

  getMeetings = (size: number): Observable<Meeting[]> =>
    this.http.get<Meeting[]>(`${this.baseUrl}/meetings?size=${size}`)

  getLatestMeeting = (): Observable<Meeting> =>
    this.http.get<Meeting>(`${this.baseUrl}/meetings/latest`)

  getRecentCollaborations = (meetingSize: number): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations/recent?meetingSize=${meetingSize}`)

  getMeetingCollaborations = (meeting: string): Observable<Collaboration[]> =>
    this.http.get<Collaboration[]>(`${this.baseUrl}/collaborations/by-meeting?meeting=${meeting}`)

  getDrawInheritances = (meetingSize: number): Observable<DrawInheritance[]> =>
    this.http.get<DrawInheritance[]>(`${this.baseUrl}/draws/inheritance?meetingSize=${meetingSize}`)

  getLatestDrawInheritances = (): Observable<DrawInheritance[]> =>
    this.http.get<DrawInheritance[]>(`${this.baseUrl}/draws/inheritance/latest`)

  getSyndicateSnapshots = (meetingSize: number): Observable<SyndicateSnapshot[]> =>
    this.http.get<SyndicateSnapshot[]>(`${this.baseUrl}/syndicates/snapshots?meetingSize=${meetingSize}`)

  getTrackworkSnapshots = (meetingSize: number): Observable<TrackworkSnapshot[]> =>
    this.http.get<TrackworkSnapshot[]>(`${this.baseUrl}/trackworks/snapshots?meetingSize=${meetingSize}`)

  getBlacklistConnections = (meeting: string): Observable<BlacklistConnection[]> =>
    this.http.get<BlacklistConnection[]>(`${this.baseUrl}/players/blacklist-connections?meeting=${meeting}`)

  getFixtures = (): Observable<Fixture[]> =>
    this.http.get<Fixture[]>(`${this.baseUrl}/fixtures`)

  getBacktestFactors = (): Observable<Factor[]> =>
    this.http.get<Factor[]>(`${this.backtestBaseUrl}/factors`)

  getGeneralChanceFactorHits = (factorCombinations: string[][]): Observable<FactorHit[]> =>
    this.http.post<FactorHit[]>(`${this.backtestBaseUrl}/general-hits`, factorCombinations)
}
