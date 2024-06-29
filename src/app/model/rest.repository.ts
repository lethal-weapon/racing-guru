import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Reminder} from './reminder.model';
import {Horse} from './horse.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {RaceConnection} from './connection.model';
import {FactorHit} from './backtest.model';
import {Racecard} from './racecard.model';
import {Report} from './report.model';
import {Bet} from './bet.model';
import {DrawInheritance} from './draw.model';
import {Syndicate, SyndicateSnapshot} from './syndicate.model';
import {TrackworkSnapshot} from './trackwork.model';
import {FavoritePost, Interview, SelectionPost} from './dto.model';
import {Player} from './player.model';

@Injectable()
export class RestRepository {
  private bets: Bet[] = [];
  private players: Player[] = [];
  private reminders: Reminder[] = [];
  private horses: Horse[] = [];
  private reports: Report[] = [];
  private meetings: Meeting[] = [];
  private syndicates: Syndicate[] = [];
  private collaborations: Collaboration[] = [];
  private racecards: Racecard[] = [];
  private factorHits: FactorHit[] = [];
  private connections: RaceConnection[] = [];
  private drawInheritances: DrawInheritance[] = [];
  private syndicateSnapshots: SyndicateSnapshot[] = [];
  private trackworkSnapshots: TrackworkSnapshot[] = [];

  constructor(private source: RestDataSource) {
  }

  findBets = () => this.bets
  findHorses = () => this.horses
  findPlayers = () => this.players
  findReports = () => this.reports
  findReminders = () => this.reminders
  findSyndicates = () => this.syndicates
  findRacecards = () => this.racecards
  findMeetings = () => this.meetings
  findCollaborations = () => this.collaborations
  findDrawInheritances = () => this.drawInheritances
  findSyndicateSnapshots = () => this.syndicateSnapshots
  findTrackworkSnapshots = () => this.trackworkSnapshots
  findFactorHits = () => this.factorHits
  findConnections = () => this.connections

  saveFavorite = (favorite: FavoritePost) =>
    this.source.saveFavorite(favorite).subscribe(data => {
    })

  saveSelection = (selection: SelectionPost) =>
    this.source.saveSelection(selection).subscribe(data => {
    })

  savePlayer = (
    player: Player,
    successCallback: (saved: Player) => any,
    errorCallback: () => any
  ) =>
    this.source.savePlayer(player).subscribe(
      data => {
        const index = this.players.findIndex(p => p.code === data.code);
        if (index === -1) this.players.push(data);
        else this.players.splice(index, 1, data);

        successCallback(data);
      },
      error => errorCallback()
    )

  savePlayerOrders = (
    players: Player[],
    successCallback: (saved: Player[]) => any,
    errorCallback: () => any
  ) =>
    this.source.savePlayerOrders(players).subscribe(
      data => {
        data.forEach(saved => {
          const index = this.players.findIndex(p => p.code === saved.code);
          if (index !== -1) this.players.splice(index, 1, saved);
        });
        successCallback(data);
      },
      error => errorCallback()
    )

  saveSyndicate = (
    syndicate: Syndicate,
    successCallback: (saved: Syndicate) => any
  ) => {
    this.source.saveSyndicate(syndicate).subscribe(data => {
      this.syndicates = this.syndicates.filter(s => s.id !== data.id);
      this.syndicates.push(data);
      successCallback(data);
    })
  }

  deleteSyndicate = (
    syndicate: Syndicate,
    successCallback: () => any
  ) =>
    this.source.deleteSyndicate(syndicate).subscribe(data => {
      this.syndicates = this.syndicates.filter(s => s.id !== syndicate.id);
      successCallback();
    })

  saveInterview = (
    interviews: Interview[],
    successCallback: () => any,
    errorCallback: () => any
  ) => {
    this.source.saveInterview(interviews).subscribe(
      data => {
        this.racecards = data;
        successCallback();
      },
      error => errorCallback()
    )
  }

  fetchRacecards = (
    meeting: string = 'latest',
    callback: () => any = () => console.log(``)
  ) => {
    this.source.getRacecards(meeting).subscribe(data => {
      this.racecards = data;
      callback();
    })
  }

  fetchPlayers = (callback: (players: Player[]) => any) =>
    this.source.getPlayers().subscribe(data => {
      this.players = data;
      callback(data);
    })

  fetchReminders = () =>
    this.source.getReminders().subscribe(data => this.reminders = data)

  fetchHorses = () =>
    this.source.getHorses().subscribe(data => this.horses = data)

  fetchMeetingHorses = () =>
    this.source.getMeetingHorses().subscribe(data => this.horses = data)

  fetchReports = () =>
    this.source.getReports().subscribe(data => this.reports = data)

  fetchBets = () =>
    this.source.getBets().subscribe(data => this.bets = data)

  fetchMeetings = () =>
    this.source.getMeetings().subscribe(data => this.meetings = data)

  fetchCollaborations = () =>
    this.source.getCollaborations().subscribe(data => this.collaborations = data)

  fetchFactorHits = (factorCombinations: string[][], callback: () => any) =>
    this.source.getBacktestFactorHits(factorCombinations).subscribe(data => {
      this.factorHits = data;
      callback();
    })

  fetchConnections = (meeting: string = 'latest') =>
    this.source.getConnections(meeting).subscribe(data => this.connections = data)

  fetchDrawInheritances = () =>
    this.source.getDrawInheritances().subscribe(data => this.drawInheritances = data)

  fetchSyndicates = () =>
    this.source.getSyndicates().subscribe(data => this.syndicates = data)

  fetchSyndicateSnapshots = () =>
    this.source.getSyndicateSnapshots().subscribe(data => this.syndicateSnapshots = data)

  fetchTrackworkSnapshots = () =>
    this.source.getTrackworkSnapshots().subscribe(data => this.trackworkSnapshots = data)
}
