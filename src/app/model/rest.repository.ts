import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Note} from './note.model';
import {Horse} from './horse.model';
import {Syndicate, SyndicatePerformance} from './syndicate.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {ConnectionDividend, RaceConnection} from './connection.model';
import {FactorHit} from './backtest.model';
import {Racecard} from './racecard.model';
import {Report} from './report.model';
import {Record} from './record.model';
import {NegativePerformance, SeasonPerformance} from './performance.model';
import {TrackBiasScore} from './bias.model';
import {SpeedFigure} from './speed.model';
import {TrackworkGrade} from './trackwork.model';
import {
  DividendDto,
  DrawPerformance,
  FavoritePost,
  Interview,
  SelectionPost
} from './dto.model';

@Injectable()
export class RestRepository {
  private notes: Note[] = [];
  private horses: Horse[] = [];
  private reports: Report[] = [];
  private records: Record[] = [];
  private meetings: Meeting[] = [];
  private syndicates: Syndicate[] = [];
  private collaborations: Collaboration[] = [];
  private racecards: Racecard[] = [];
  private factorHits: FactorHit[] = [];
  private enginePerformances: SeasonPerformance[] = [];
  private negativeEnginePerformances: NegativePerformance[] = [];
  private dividends: DividendDto[] = [];
  private syndicatePerformances: SyndicatePerformance[] = [];
  private connections: RaceConnection[] = [];
  private connectionDividends: ConnectionDividend[] = [];
  private trackBiasScores: TrackBiasScore[] = [];
  private speedFigures: SpeedFigure[] = [];
  private drawPerformances: DrawPerformance[] = [];
  private trackworkGrades: TrackworkGrade[] = [];

  constructor(private source: RestDataSource) {
  }

  findNotes = () => this.notes
  findHorses = () => this.horses
  findReports = () => this.reports
  findRecords = () => this.records
  findMeetings = () => this.meetings
  findCollaborations = () => this.collaborations
  findRacecards = () => this.racecards
  findFactorHits = () => this.factorHits
  findEnginePerformances = () => this.enginePerformances
  findNegativeEnginePerformances = () => this.negativeEnginePerformances
  findSyndicates = () => this.syndicates
  findDividends = () => this.dividends
  findSyndicatePerformances = () => this.syndicatePerformances
  findConnections = () => this.connections
  findConnectionDividends = () => this.connectionDividends
  findTrackBiasScores = () => this.trackBiasScores
  findSpeedFigures = () => this.speedFigures
  findDrawPerformances = () => this.drawPerformances
  findTrackworkGrades = () => this.trackworkGrades

  saveFavorite = (favorite: FavoritePost) =>
    this.source.saveFavorite(favorite).subscribe(data => {
    })

  saveSelection = (selection: SelectionPost) =>
    this.source.saveSelection(selection).subscribe(data => {
    })

  saveNote = (note: Note) =>
    this.source.saveNote(note).subscribe(data => {
    })

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
      error => {
        errorCallback();
      }
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

  fetchNotes = () =>
    this.source.getNotes().subscribe(data => this.notes = data)

  fetchHorses = () =>
    this.source.getHorses().subscribe(data => this.horses = data)

  fetchMeetingHorses = () =>
    this.source.getMeetingHorses().subscribe(data => this.horses = data)

  fetchReports = () =>
    this.source.getReports().subscribe(data => this.reports = data)

  fetchRecords = () =>
    this.source.getRecords().subscribe(data => this.records = data)

  fetchMeetings = () =>
    this.source.getMeetings().subscribe(data => this.meetings = data)

  fetchCollaborations = () =>
    this.source.getCollaborations().subscribe(data => this.collaborations = data)

  fetchFactorHits = (factorCombinations: string[][], callback: () => any) =>
    this.source.getBacktestFactorHits(factorCombinations).subscribe(data => {
      this.factorHits = data;
      callback();
    })

  fetchEnginePerformance = () =>
    this.source.getEnginePerformance().subscribe(data => this.enginePerformances = data)

  fetchNegativeEnginePerformance = () =>
    this.source.getNegativeEnginePerformance().subscribe(data => this.negativeEnginePerformances = data)

  fetchSyndicates = () =>
    this.source.getSyndicates().subscribe(data => this.syndicates = data)

  fetchDividends = () =>
    this.source.getDividends().subscribe(data => this.dividends = data)

  fetchSyndicatePerformance = () =>
    this.source.getSyndicatePerformance().subscribe(data => this.syndicatePerformances = data)

  fetchConnections = (meeting: string = 'latest') =>
    this.source.getConnections(meeting).subscribe(data => this.connections = data)

  fetchConnectionDividends = () =>
    this.source.getConnectionDividends().subscribe(data => this.connectionDividends = data)

  fetchTrackBiasScores = () =>
    this.source.getTrackBiasScores().subscribe(data => this.trackBiasScores = data)

  fetchSpeedFigures = () =>
    this.source.getSpeedFigures().subscribe(data => this.speedFigures = data)

  fetchDrawPerformance = () =>
    this.source.getDrawPerformance().subscribe(data => this.drawPerformances = data)

  fetchTrackworkGrades = () =>
    this.source.getTrackworkGrades().subscribe(data => this.trackworkGrades = data)

}