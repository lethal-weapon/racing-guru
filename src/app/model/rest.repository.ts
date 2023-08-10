import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Horse} from './horse.model';
import {HorseOwner} from './owner.model';
import {Meeting} from './meeting.model';
import {FavoritePost, Interview} from './dto.model';
import {Collaboration} from './collaboration.model';
import {EngineYield, FactorHit} from './backtest.model';
import {Racecard} from './racecard.model';

@Injectable()
export class RestRepository {
  private horses: Horse[] = [];
  private owners: HorseOwner[] = [];
  private meetings: Meeting[] = [];
  private collaborations: Collaboration[] = [];
  private factorHits: FactorHit[] = [];
  private engines: EngineYield[] = [];
  private racecards: Racecard[] = [];

  constructor(private source: RestDataSource) {
  }

  findHorses = () => this.horses
  findOwners = () => this.owners
  findMeetings = () => this.meetings
  findCollaborations = () => this.collaborations
  findFactorHits = () => this.factorHits
  findEngines = () => this.engines
  findRacecards = () => this.racecards

  saveFavorite = (favorite: FavoritePost) =>
    this.source.saveFavorite(favorite).subscribe(data => {
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
      error => errorCallback()
    )

  fetchRacecards = (meeting: string, callback: () => any) =>
    this.source.getRacecards(meeting).subscribe(data => {
      this.racecards = data;
      callback();
    })

  fetchHorses = () =>
    this.source.getHorses().subscribe(data => this.horses = data)

  fetchOwners = () =>
    this.source.getOwners().subscribe(data => this.owners = data)

  fetchMeetings = () =>
    this.source.getMeetings().subscribe(data => this.meetings = data)

  fetchCollaborations = () =>
    this.source.getCollaborations().subscribe(data => this.collaborations = data)

  fetchFactorHits = (factorCombinations: string[][], callback: () => any) =>
    this.source.getBacktestAccuracy(factorCombinations).subscribe(data => {
      this.factorHits = data;
      callback();
    })

  fetchEngines = () =>
    this.source.getBacktestEngines().subscribe(data => this.engines = data)

  fetchEngineYields = (name: string, factors: string[], callback: () => any) =>
    this.source.getBacktestYields(factors).subscribe(data => {
      let engine = this.engines.find(e => e.name === name)
      if (engine) engine.yields = data
      callback();
    })
}