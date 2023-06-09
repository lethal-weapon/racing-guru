import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../model/websocket.service';
import {Horse, PastStarter, DEFAULT_HORSE} from '../model/horse.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {RestRepository} from '../model/rest.repository';
import {
  COLORS,
  COMMON_HORSE_ORIGINS
} from '../util/strings';
import {
  Collaboration,
  CollaborationStarter,
  DEFAULT_COLLABORATION
} from '../model/collaboration.model';
import {
  ONE_MILLION,
  PAYOUT_RATE,
  SENIOR_HORSE_AGE,
  THREE_SECONDS,
  TWO_MINUTES
} from '../util/numbers';
import {
  getCurrentMeeting,
  getHorseProfileUrl,
  getMaxRace,
  getNewFavorites,
  getPlacingBorderBackground,
  getRaceBadgeStyle,
  getStarterQQPWinPlaceOdds,
  getStarters,
  getStarterWinPlaceOdds,
  isFavorite
} from '../util/functions';

interface PersonStarter {
  meeting: string,
  race: number,
  partner: string,
  horse: string,
  placing: number,
  winOdds: number
}

interface PersonSection {
  person: string
  wins: number,
  seconds: number,
  thirds: number,
  fourths: number,
  starters: PersonStarter[]
}

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;

  protected readonly COLORS = COLORS;
  protected readonly SENIOR_HORSE_AGE = SENIOR_HORSE_AGE;
  protected readonly COMMON_HORSE_ORIGINS = COMMON_HORSE_ORIGINS;
  protected readonly isFavorite = isFavorite;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getStarters = getStarters;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;
  protected readonly getHorseProfileUrl = getHorseProfileUrl;
  protected readonly getPlacingBorderBackground = getPlacingBorderBackground;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService
  ) {
    socket.racecards.subscribe(data => this.racecards = data);
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), THREE_SECONDS);

    this.repo.fetchHorses();
    this.repo.fetchCollaborations();

    setInterval(() => {
      this.repo.fetchHorses();
      this.repo.fetchCollaborations();
    }, TWO_MINUTES);
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  formatVenue = (venue: string): string =>
    ['HV', 'ST'].includes(venue) ? venue : 'OS'

  formatPerson = (person: string): string =>
    person.length <= 3
      ? person
      : person.split(' ')[1].slice(0, 3).toUpperCase()

  toggleFavorite = (starter: Starter) =>
    this.repo.saveFavorite({
      meeting: getCurrentMeeting(this.racecards),
      race: this.activeRace,
      favorites: getNewFavorites(starter, this.activeRacecard)
    })

  getHorse = (starter: Starter): Horse =>
    this.repo.findHorses()
      .find(s => s.code === starter.horse) || DEFAULT_HORSE

  getCollaboration = (starter: Starter): Collaboration =>
    this.repo.findCollaborations()
      .find(c => c.jockey === starter.jockey && c.trainer === starter.trainer)
    || DEFAULT_COLLABORATION;

  getHorseStatistics = (starter: Starter): string => {
    const h = this.getHorse(starter);
    return `${h.total1st}-${h.total2nd}-${h.total3rd}/${h.totalRuns}`;
  }

  getPastHorseStarters = (current: Starter): PastStarter[] =>
    (
      this.repo.findHorses()
        .find(s => s.code === current.horse)
        ?.pastStarters || []
    )
      .slice(0, 20)

  getPastCollaborationStarters = (current: Starter): CollaborationStarter[] =>
    (
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
      .slice(0, 35)

  getPersonSections = (starter: Starter): PersonSection[] =>
    [
      (this.repo.findCollaborations().filter(c => c.jockey === starter.jockey) || []),
      (this.repo.findCollaborations().filter(c => c.trainer === starter.trainer) || [])
    ].map((colls, index) => ({
        person: index === 0 ? starter.jockey : starter.trainer,
        wins: colls.map(c => c.wins).reduce((prev, curr) => prev + curr, 0),
        seconds: colls.map(c => c.seconds).reduce((prev, curr) => prev + curr, 0),
        thirds: colls.map(c => c.thirds).reduce((prev, curr) => prev + curr, 0),
        fourths: colls.map(c => c.fourths).reduce((prev, curr) => prev + curr, 0),
        starters: this.getPersonStarters(
          index === 0 ? starter.jockey : starter.trainer,
          colls
        )
      })
    )

  getPersonStarters = (person: string, collaborations: Collaboration[]): PersonStarter[] =>
    collaborations
      .map(c =>
        c.starters.map(s => ({
          meeting: s.meeting,
          race: s.race,
          partner: [c.jockey, c.trainer].find(p => p !== person) || '?',
          horse: s.horseNameCH,
          placing: s?.placing || 0,
          winOdds: s?.winOdds || 0
        }))
      )
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(s => {
        if (s.meeting !== getCurrentMeeting(this.racecards)) return true;
        return s.meeting === getCurrentMeeting(this.racecards) && s.race < this.activeRace;
      })
      .sort((r1, r2) =>
        r2.meeting.localeCompare(r1.meeting) || r2.race - r1.race
      )
      .slice(0, 20)

  getActiveStarterWQPInvestments(starter: Starter): Array<{ percent: string, amount: string }> {
    const pool = this.activeRacecard?.pool;
    if (!pool) return [];

    const WP = getStarterWinPlaceOdds(starter, this.activeRacecard);
    const QQP_WP = getStarterQQPWinPlaceOdds(starter, this.activeRacecard);

    return [
      {odds: WP.win, amount: pool.win},
      {odds: QQP_WP[0], amount: pool.quinella},
      {odds: 3 * WP.place, amount: pool.place},
      {odds: 3 * QQP_WP[1], amount: pool?.quinellaPlace || 0}
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