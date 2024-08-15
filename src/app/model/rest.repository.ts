import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Interview} from './interview.model';
import {DEFAULT_PICK, Pick} from './pick.model';
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
import {Factor, FactorHit} from './backtest.model';
import {Fixture} from './fixture.model';
import {AccumulatedSeasonEarning} from './earning.model';

@Injectable()
export class RestRepository {
  private pick: Pick = DEFAULT_PICK;
  private bets: Bet[] = [];
  private horses: Horse[] = [];
  private players: Player[] = [];
  private reports: Report[] = [];
  private reminders: Reminder[] = [];
  private racecards: Racecard[] = [];
  private recommendations: Recommendation[] = [];
  private syndicates: Syndicate[] = [];
  private meetings: Meeting[] = [];
  private collaborations: Collaboration[] = [];
  private drawInheritances: DrawInheritance[] = [];
  private syndicateSnapshots: SyndicateSnapshot[] = [];
  private trackworkSnapshots: TrackworkSnapshot[] = [];
  private blacklistConnections: BlacklistConnection[] = [];
  private accumulatedSeasonEarnings: AccumulatedSeasonEarning[] = [];

  private fixtures: Fixture[] = [];
  private factors: Factor[] = [];
  private factorHits: FactorHit[] = [];

  constructor(private source: RestDataSource) {
  }

  findPick = () => this.pick
  findBets = () => this.bets
  findHorses = () => this.horses
  findPlayers = () => this.players
  findReports = () => this.reports
  findReminders = () => this.reminders
  findRacecards = () => this.racecards
  findRecommendations = () => this.recommendations
  findSyndicates = () => this.syndicates
  findMeetings = () => this.meetings
  findCollaborations = () => this.collaborations
  findDrawInheritances = () => this.drawInheritances
  findSyndicateSnapshots = () => this.syndicateSnapshots
  findTrackworkSnapshots = () => this.trackworkSnapshots
  findBlacklistConnections = () => this.blacklistConnections
  findAccumulatedSeasonEarnings = () => this.accumulatedSeasonEarnings

  findFixtures = () => this.fixtures
  findFactors = () => this.factors
  findFactorHits = () => this.factorHits

  fetchPick = (callback: () => any) =>
    this.source.getPick().subscribe(data => {
      this.pick = data;
      callback();
    })

  savePick = (newPick: Pick) =>
    this.source.savePick(newPick).subscribe(data => this.pick = data)

  fetchBets = () =>
    this.source.getBets().subscribe(data => this.bets = data)

  fetchHorseWithoutStarters = () =>
    this.source.getHorseWithoutStarters().subscribe(data => this.horses = data)

  fetchMeetingHorses = () =>
    this.source.getMeetingHorses().subscribe(data => this.horses = data)

  fetchActivePlayers = () =>
    this.source.getActivePlayers().subscribe(data => this.players = data)

  fetchPlayers = (callback: (players: Player[]) => any) =>
    this.source.getPlayers().subscribe(data => {
      this.players = data;
      callback(data);
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

  fetchReports = (size: number = 8) =>
    this.source.getReports(size).subscribe(data => this.reports = data)

  fetchReminders = (size: number = 8) =>
    this.source.getReminders(size).subscribe(data => this.reminders = data)

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

  fetchRecommendations = (
    size: number = 8,
    callback: () => any = () => console.log(``)
  ) =>
    this.source.getRecommendations(size).subscribe(data => {
      this.recommendations = data;
      callback();
    })

  fetchSyndicates = () =>
    this.source.getSyndicates().subscribe(data => this.syndicates = data)

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

  fetchMeetings = (
    size: number = 8,
    callback: () => any = () => console.log(``)
  ) =>
    this.source.getMeetings(size).subscribe(data => {
      this.meetings = data;
      callback();
    })

  fetchLatestMeeting = (callback: () => any = () => console.log(``)) =>
    this.source.getLatestMeeting().subscribe(data => {
      const index = this.meetings.findIndex(m => m.meeting === data.meeting);
      if (index === -1) this.meetings.unshift(data);
      else this.meetings.splice(index, 1, data);

      callback();
    })

  updateMeetingFromSocket = (newMeeting: Meeting) => {
    const index = this.meetings.findIndex(m => m.meeting === newMeeting.meeting);
    if (index === -1) this.meetings.unshift(newMeeting);
    else this.meetings.splice(index, 1, newMeeting);
  }

  fetchAccumulatedSeasonEarnings = (callback: () => any) =>
    this.source.getAccumulatedSeasonEarnings().subscribe(data => {
      this.accumulatedSeasonEarnings = data;
      callback();
    })

  fetchRecentCollaborations = (meetingSize: number = 16) =>
    this.source
      .getRecentCollaborations(meetingSize)
      .subscribe(data => this.collaborations = data)

  fetchMeetingCollaborations = (
    meeting: string = 'latest',
    callback: () => any = () => console.log(``)
  ) =>
    this.source.getMeetingCollaborations(meeting).subscribe(data => {
      this.collaborations = data;
      callback();
    })

  fetchDrawInheritances = (meetingSize: number = 8) =>
    this.source
      .getDrawInheritances(meetingSize)
      .subscribe(data => this.drawInheritances = data)

  fetchLatestDrawInheritances = () =>
    this.source.getLatestDrawInheritances().subscribe(data => {
      data.forEach(d => {
        const index = this.drawInheritances
          .findIndex(s => s.meeting === d.meeting && s.race === d.race);

        if (index === -1) this.drawInheritances.unshift(d);
        else this.drawInheritances.splice(index, 1, d);
      });
    })

  fetchSyndicateSnapshots = (meetingSize: number = 8) =>
    this.source
      .getSyndicateSnapshots(meetingSize)
      .subscribe(data => this.syndicateSnapshots = data)

  updateSyndicateSnapshotFromSocket = (newSnapshot: SyndicateSnapshot) => {
    const index = this.syndicateSnapshots.findIndex(s => s.meeting === newSnapshot.meeting);
    if (index === -1) this.syndicateSnapshots.unshift(newSnapshot);
    else this.syndicateSnapshots.splice(index, 1, newSnapshot);
  }

  fetchTrackworkSnapshots = (meetingSize: number = 8) =>
    this.source
      .getTrackworkSnapshots(meetingSize)
      .subscribe(data => this.trackworkSnapshots = data)

  fetchBlacklistConnections = (meeting: string = 'latest') =>
    this.source
      .getBlacklistConnections(meeting)
      .subscribe(data => this.blacklistConnections = data)

  fetchFixtures = () =>
    this.source.getFixtures().subscribe(data => this.fixtures = data)

  fetchBacktestFactors = (callback: () => any) =>
    this.source.getBacktestFactors().subscribe(data => {
      this.factors = data;
      callback();
    })

  fetchGeneralChanceFactorHits = (
    factorCombinations: string[][],
    callback: () => any
  ) =>
    this.source
      .getGeneralChanceFactorHits(factorCombinations)
      .subscribe(data => {
        this.factorHits = data;
        callback();
      })

  fetchExactChanceFactorHits = (
    factorCombinations: string[][],
    callback: () => any
  ) =>
    this.source
      .getExactChanceFactorHits(factorCombinations)
      .subscribe(data => {
        this.factorHits = data;
        callback();
      })
}
