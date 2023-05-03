import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Meeting} from './meeting.model';
import {Statistics} from './statistics.model';
import {FinalDividend} from './dividend.model';
import {RaceHorse} from './racehorse.model';
import {Collaboration} from './collaboration.model';
import {PastStarter} from './starter.model';
import {FavoritePost} from "./favorite.model";

@Injectable()
export class RestRepository {
  private meetings: Meeting[] = [];
  private statistics: Statistics[] = [];
  private finalDividends: FinalDividend[] = [];
  private racehorses: RaceHorse[] = [];
  private collaborations: Collaboration[] = [];
  private pastStarters: PastStarter[] = [];

  constructor(private source: RestDataSource) {
  }

  findMeetings = () => this.meetings
  findStatistics = () => this.statistics
  findFinalDividends = () => this.finalDividends
  findRacehorses = () => this.racehorses
  findCollaborations = () => this.collaborations
  findPastStarters = () => this.pastStarters

  fetchPastStarters = () =>
    this.source.getPastStarters().subscribe(data => this.pastStarters = data)

  fetchCollaborations = () =>
    this.source.getCollaborations().subscribe(data => this.collaborations = data)

  fetchRacehorses = () =>
    this.source.getRacehorses().subscribe(data => this.racehorses = data)

  fetchFinalDividends = () =>
    this.source.getFinalDividends().subscribe(data => this.finalDividends = data)

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