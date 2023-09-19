import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {FavoritePost, Interview, SelectionPost} from './dto.model';
import {Note} from './note.model';
import {Horse} from './horse.model';
import {HorseOwner} from './owner.model';
import {Meeting} from './meeting.model';
import {Collaboration} from './collaboration.model';
import {FactorHit} from './backtest.model';
import {Racecard} from './racecard.model';
import {Report} from './report.model';
import {Record} from './record.model';
import {SeasonPerformance} from './performance.model';

@Injectable()
export class RestRepository {
  private notes: Note[] = [];
  private horses: Horse[] = [];
  private owners: HorseOwner[] = [];
  private reports: Report[] = [];
  private records: Record[] = [];
  private meetings: Meeting[] = [];
  private collaborations: Collaboration[] = [];
  private racecards: Racecard[] = [];
  private factorHits: FactorHit[] = [];
  private performances: SeasonPerformance[] = [];

  constructor(private source: RestDataSource) {
  }

  findNotes = () => this.notes
  findHorses = () => this.horses
  findOwners = () => this.owners
  findReports = () => this.reports
  findRecords = () => this.records
  findMeetings = () => this.meetings
  findCollaborations = () => this.collaborations
  findRacecards = () => this.racecards
  findFactorHits = () => this.factorHits
  findPerformances = () => this.performances

  saveFavorite = (favorite: FavoritePost) =>
    this.source.saveFavorite(favorite).subscribe(data => {
    })

  saveSelection = (selection: SelectionPost) =>
    this.source.saveSelection(selection).subscribe(data => {
    })

  saveNote = (note: Note) =>
    this.source.saveNote(note).subscribe(data => {
    })

  saveInterview = (
    interviews: Interview[],
    successCallback: () => any,
    errorCallback: () => any
  ) =>
    this.source.saveInterview(interviews).subscribe(
      data => {
        this.racecards = data;
        successCallback();
      },
      error => {
        errorCallback();
      }
    )

  fetchRacecards = (meeting: string, callback: () => any) =>
    this.source.getRacecards(meeting).subscribe(data => {
      this.racecards = data;
      callback();
    })

  fetchNotes = () =>
    this.source.getNotes().subscribe(data => this.notes = data)

  fetchHorses = () =>
    this.source.getHorses().subscribe(data => this.horses = data)

  fetchOwners = () =>
    this.source.getOwners().subscribe(data => this.owners = data)

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
    this.source.getEnginePerformance().subscribe(data => this.performances = data)

}