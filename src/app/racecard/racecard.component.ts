import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../model/websocket.service';
import {PastStarter, Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {ONE_MILLION, ONE_MINUTE, PAYOUT_RATE, THREE_SECONDS} from '../util/numbers';
import {RestRepository} from '../model/rest.repository';
import {CollaborationStarter} from '../model/collaboration.model';
import {
  getCurrentMeeting,
  getHorseProfileUrl,
  getMaxRace,
  getNewFavorites,
  getPlacingBorderBackground,
  getRaceBadgeStyle,
  getStarterQWOdds,
  getStarters,
  getStarterWinPlaceOdds,
  isFavorite
} from '../util/functions';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;

  protected readonly isFavorite = isFavorite;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getStarters = getStarters;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;
  protected readonly getHorseProfileUrl = getHorseProfileUrl;
  protected readonly getPlacingBorderBackground = getPlacingBorderBackground;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;

  constructor(
    private socket: WebsocketService,
    private repo: RestRepository
  ) {
    socket.racecards.subscribe(data => {
      this.racecards = data;
      this.racecards.sort((r1, r2) => r1.race - r2.race);
    });
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), THREE_SECONDS);

    this.repo.fetchPastStarters();
    this.repo.fetchCollaborations();

    setInterval(() => {
      this.repo.fetchPastStarters();
      this.repo.fetchCollaborations();
    }, ONE_MINUTE);
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  toggleFavorite = (starter: Starter) => {
    this.repo.saveFavorite({
      meeting: getCurrentMeeting(this.racecards),
      race: this.activeRace,
      favorites: getNewFavorites(starter, this.activeRacecard)
    });
  }

  getPastHorseStarters(current: Starter): PastStarter[] {
    return this.repo.findPastStarters()
      .filter(s => s.horse === current.horse)
      .slice(0, 16);
  }

  getPastCollaborationStarters(current: Starter): CollaborationStarter[] {
    return (
      this.repo.findCollaborations()
        .filter(c => c.jockey === current.jockey && c.trainer === current.trainer)
        .pop()
        ?.starters || []
    )
      .filter(s => {
        if (s.meeting !== getCurrentMeeting(this.racecards)) return true;
        return s.meeting === getCurrentMeeting(this.racecards) && s.race < this.activeRace;
      })
      .sort((r1, r2) =>
        r2.meeting.localeCompare(r1.meeting) || r2.race - r1.race
      )
      .slice(0, 28);
  }

  getActiveStarterWQPInvestments(starter: Starter): Array<{ percent: string, amount: string }> {
    const pool = this.activeRacecard?.pool;
    if (!pool) return [];

    const WP = getStarterWinPlaceOdds(starter, this.activeRacecard);
    const QW = getStarterQWOdds(starter, this.activeRacecard);

    return [
      {odds: WP.win, amount: pool.win},
      {odds: QW, amount: pool.quinella},
      {odds: 3 * WP.place, amount: pool.place}
    ].map(o => ({
      percent: `${(100 * PAYOUT_RATE / o.odds).toFixed(1)}%`,
      amount: `$${(o.amount * PAYOUT_RATE / o.odds / ONE_MILLION).toFixed(2)}M`
    }));
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }
}