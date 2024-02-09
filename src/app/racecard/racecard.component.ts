import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {WebsocketService} from '../model/websocket.service';
import {Horse, PastStarter, DEFAULT_HORSE} from '../model/horse.model';
import {Note} from '../model/note.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {Selection} from '../model/dto.model';
import {DEFAULT_SPEED_FIGURE} from '../model/speed.model';
import {
  COLORS,
  COMMON_HORSE_ORIGINS,
  PLACING_MAPS,
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
  THIRTY_SECONDS,
  ONE_DAY_MILL
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
  getPersonSummaryByRace,
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
  isEditMode: boolean = false;
  editingSelections: Selection[] = [];

  protected readonly COLORS = COLORS;
  protected readonly PLACING_MAPS = PLACING_MAPS;
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
    socket.addCloseCallback(() => socket.racecards.unsubscribe());
    socket.addReconnectCallback(() =>
      socket.racecards.subscribe(data => this.racecards = data));

    socket.racecards.subscribe(data => this.racecards = data);
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), THREE_SECONDS);

    this.repo.fetchNotes();
    this.repo.fetchHorses();
    this.repo.fetchMeetings();
    this.repo.fetchCollaborations();
    this.repo.fetchSpeedFigures();

    setInterval(() => this.repo.fetchCollaborations(), THIRTY_SECONDS);
  }

  formatMeeting = (meeting: string): string => {
    const pastMeeting = new Date(meeting).getTime();
    const currentMeeting = new Date(this.racecards[0].meeting).getTime();
    const diffDays = (currentMeeting - pastMeeting) / ONE_DAY_MILL;
    const diffMonths = (diffDays / 30).toFixed(1);
    const diffYears = (diffDays / 365).toFixed(1);

    if (diffDays < 100) return `${diffDays}D`;
    if (diffDays < 365) return `${diffMonths}M`;
    return `${diffYears}Y`;
  }

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

  clickRaceBadge = (clickedRace: number) => {
    if (!this.isEditMode) {
      this.activeRace = clickedRace;
    }
  }

  clickEditButton = () => {
    if (!this.isEditMode) {
      this.isEditMode = true;
      this.editingSelections = this.activeRacecard.selections.map(s => s);

    } else {
      this.isEditMode = false;
      this.repo.saveSelection({
        meeting: getCurrentMeeting(this.racecards),
        race: this.activeRace,
        selections: this.editingSelections
      });
    }
  }

  toggleSelection = (starter: Starter, placing: number) => {
    if (!this.isEditMode) return;

    if (this.isSelection(starter, placing))
      this.editingSelections = this.editingSelections
        .filter(s => !(s.order === starter.order && s.placing === placing));
    else
      this.editingSelections.push({order: starter.order, placing: placing});
  }

  isSelection = (starter: Starter, placing: number): boolean =>
    (
      this.isEditMode
        ? this.editingSelections
        : this.activeRacecard.selections
    )
      .filter(s => s.order === starter.order && s.placing === placing)
      .length === 1

  getHorseRecent3StartAvgSpeedFigure = (starter: Starter): number => {
    const figures = this.getHorse(starter).pastStarters
      .slice(0, 3)
      .map(ps => this.getHorseSpeedFigure(starter.horse, ps.meeting))
      .filter(f => f > 0);

    if (figures.length < 1) return 0;

    const figureSum = figures.reduce((prev, curr) => prev + curr, 0);
    return Math.floor(figureSum / figures.length);
  }

  getHorseSpeedFigure = (horse: string, meeting: string): number =>
    (this.repo.findSpeedFigures().find(f => f.horse === horse) || DEFAULT_SPEED_FIGURE)
      ?.figures.find(f => f.meeting === meeting)?.figure || 0

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

  getActiveStarterWQPInvestments = (starter: Starter): Array<{ percent: string, amount: string }> => {
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

  isPublicUnderEstimated = (starter: Starter): boolean => {
    const investments = this.getActiveStarterWQPInvestments(starter);
    if (investments.length === 0) return false;

    const modelChance = 100 * (starter?.chance || 0);
    const publicChance = parseFloat(investments[0].percent.replace('%', ''));
    const tops = this.startersSortedByChance.map(s => s.order).slice(0, 6);

    return tops.includes(starter.order) && (modelChance - publicChance >= 3);
  }

  isModelUnderEstimated = (starter: Starter): boolean => {
    const investments = this.getActiveStarterWQPInvestments(starter);
    if (investments.length === 0) return false;

    const modelChance = 100 * (starter?.chance || 0);
    const publicChance = parseFloat(investments[0].percent.replace('%', ''));
    const bottoms = this.startersSortedByChance.map(s => s.order).slice(6);

    return bottoms.includes(starter.order) && (publicChance - modelChance >= 3);
  }

  isInStarvationList = (starter: Starter): boolean =>
    this.meetingNote.starvation.includes(starter.jockey) ||
    this.meetingNote.starvation.includes(starter.trainer)

  getStarterStatSumColor = (starter: Starter, index: number): string => {
    const starterSum = this.getPersonStatOnSameRace(starter, index)[2];
    const isSumTop3 = this.startersSortedByChance
      .map(s => this.getPersonStatOnSameRace(s, index)[2])
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort((s1, s2) => s2 - s1)
      .slice(0, 3)
      .includes(starterSum);

    return isSumTop3 ? COLORS[index] : '';
  }

  getPersonStatOnSameRace = (starter: Starter, index: number): number[] => {
    const meetings = this.repo.findMeetings().filter((_, index) => index > 0);
    const stats = [starter.jockey, starter.trainer]
      .map(p => getPersonSummaryByRace(meetings, p, this.activeRace, this.activeRacecard.venue))
      .map(s => [s.wins, s.seconds, s.thirds, s.fourths][index]);

    return stats.concat([stats[0] + stats[1]]);
  }

  getMeetingWinnerBeforeActiveRace = (person: string): number => {
    return this.racecards
      .filter(r => r.race < this.activeRace)
      .map(r => r.starters)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(s => [s.jockey, s.trainer].includes(person))
      .filter(s => (s?.placing || 0) === 1)
      .length;
  }

  getWinnerPoint = (starter: Starter): number => {
    let point: number = 0;
    const pair = [starter.jockey, starter.trainer];
    const blacklist = this.meetingNote.blacklist.map(pw => pw.person);
    const whitelist = this.meetingNote.whitelist.map(pw => pw.person);
    const birthlist = this.meetingNote.birthdays.map(bp => bp.person);

    const blacks = pair.filter(p => blacklist.includes(p)).length;
    const whites = pair.filter(p => whitelist.includes(p)).length;

    point -= blacks;
    point += whites;

    if (blacks > 0) {
      point += pair
        .filter(p => blacklist.includes(p))
        .map(p => this.getMeetingWinnerBeforeActiveRace(p))
        .filter(w => w > 0)
        .length;
    }
    if (whites > 0) {
      point -= pair
        .filter(p => whitelist.includes(p))
        .map(p => {
          const careerWinnersBeforeCurrentMeeting =
            this.meetingNote.whitelist.find(pw => pw.person === p)?.career || 0;

          return careerWinnersBeforeCurrentMeeting +
            this.getMeetingWinnerBeforeActiveRace(p);
        })
        .filter(w => w % 10 === 0)
        .length;
    }

    if (birthlist.includes(starter.jockey)) point += 1;
    if (birthlist.includes(starter.trainer)) point += 1;

    if (this.meetingNote.starvation.includes(starter.jockey)) point += 1;
    if (this.meetingNote.starvation.includes(starter.trainer)) point += 1;

    return point;
  }

  get startersSortedByChance(): Starter[] {
    return this.activeRacecard.starters
      .filter(s => !s.scratched)
      .sort((s1, s2) => (s2?.chance || 0) - (s1?.chance || 0))
  }

  get meetingNote(): Note {
    // @ts-ignore
    return this.repo.findNotes()
      .find(n => n.meeting === getCurrentMeeting(this.racecards));
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }
}