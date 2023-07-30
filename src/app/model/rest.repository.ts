import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Horse} from './horse.model';
import {HorseOwner} from './owner.model';
import {Meeting} from './meeting.model';
import {FavoritePost} from './favorite.model';
import {Collaboration} from './collaboration.model';
import {TesterYield} from './backtest.model';

@Injectable()
export class RestRepository {
  private horses: Horse[] = [];
  private owners: HorseOwner[] = [];
  private meetings: Meeting[] = [];
  private collaborations: Collaboration[] = [];
  private yields: TesterYield[] = [];

  constructor(private source: RestDataSource) {
  }

  findYields = () => this.yields
  findHorses = () => this.horses
  findOwners = () => this.owners
  findMeetings = () => this.meetings
  findCollaborations = () => this.collaborations

  saveFavorite = (favorite: FavoritePost) =>
    this.source.saveFavorite(favorite).subscribe(data => {
    })

  fetchYields = (factors: string[], callback: () => any) =>
    this.source.getYields(factors).subscribe(data => {
      this.yields = data;
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
}