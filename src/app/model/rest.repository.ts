import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Meeting} from './meeting.model';
import {Statistics} from './statistics.model';
import {RaceHorse} from './racehorse.model';
import {Collaboration} from './collaboration.model';
import {Horse} from './horse.model';
import {FavoritePost} from './favorite.model';

@Injectable()
export class RestRepository {
  private meetings: Meeting[] = [];
  private statistics: Statistics[] = [];
  private racehorses: RaceHorse[] = [];
  private collaborations: Collaboration[] = [];
  private horses: Horse[] = [];

  constructor(private source: RestDataSource) {
  }

  findMeetings = () => this.meetings
  findStatistics = () => this.statistics
  findRacehorses = () => this.racehorses
  findCollaborations = () => this.collaborations
  findHorses = () => this.horses

  fetchHorses = () =>
    this.source.getHorses().subscribe(data => this.horses = data)

  fetchCollaborations = () =>
    this.source.getCollaborations().subscribe(data => this.collaborations = data)

  fetchRacehorses = () =>
    this.source.getRacehorses().subscribe(data => this.racehorses = data)

  fetchStatistics = () =>
    this.source.getStatistics().subscribe(data => this.statistics = data)

  fetchMeetings = () => {
    this.source.getMeetings().subscribe(data => {
      if (this.meetings.length !== data.length) this.meetings = data;
      else {
        this.meetings.forEach(om => {
          const nm = data.filter(d => d.meeting === om.meeting).pop();
          if (nm && nm !== om) {
            om.venue = nm.venue;
            om.races = nm.races;
            om.turnover = nm.turnover;
            om.persons = nm.persons;
          }
        })
      }
    });
  }

  saveFavorite = (favorite: FavoritePost) => {
    this.source.saveFavorite(favorite).subscribe(data => {
    });
  }
}