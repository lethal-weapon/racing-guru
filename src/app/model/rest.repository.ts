import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Horse} from './horse.model';
import {RaceHorse} from './racehorse.model';
import {Collaboration} from './collaboration.model';
import {Meeting} from './meeting.model';
import {FavoritePost} from './favorite.model';

@Injectable()
export class RestRepository {
  private horses: Horse[] = [];
  private racehorses: RaceHorse[] = [];
  private collaborations: Collaboration[] = [];
  private meetings: Meeting[] = [];

  constructor(private source: RestDataSource) {
  }

  findHorses = () => this.horses
  findRacehorses = () => this.racehorses
  findCollaborations = () => this.collaborations
  findMeetings = () => this.meetings

  saveFavorite = (favorite: FavoritePost) =>
    this.source.saveFavorite(favorite).subscribe(data => {
    })

  fetchHorses = () =>
    this.source.getHorses().subscribe(data => this.horses = data)

  fetchRacehorses = () =>
    this.source.getRacehorses().subscribe(data => this.racehorses = data)

  fetchCollaborations = () =>
    this.source.getCollaborations().subscribe(data => this.collaborations = data)

  fetchMeetings = () =>
    this.source.getMeetings().subscribe(data => this.meetings = data)
}