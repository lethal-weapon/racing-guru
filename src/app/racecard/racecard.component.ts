import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../websocket.service';
import {RestRepository} from '../model/rest.repository';
import {DEFAULT_PICK, Pick, Selection} from '../model/pick.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {DEFAULT_HORSE, Horse, PastStarter} from '../model/horse.model';
import {COLORS, COMMON_HORSE_ORIGINS, PLACING_MAPS} from '../util/strings';
import {EarningStarter, Meeting} from '../model/meeting.model';
import {Collaboration, CollaborationStarter} from '../model/collaboration.model';
import {ONE_DAY_MILL, ONE_MILLION, PAYOUT_RATE, SENIOR_HORSE_AGE} from '../util/numbers';
import {
  getHorseProfileUrl,
  getMaxRace,
  getPlacingBorderBackground,
  getRaceBadgeStyle,
  getStarterQQPWinPlaceOdds,
  getStarters,
  getStarterWinPlaceOdds
} from '../util/functions';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  pick: Pick = DEFAULT_PICK;
  racecards: Racecard[] = [];
  meetings: Meeting[] = [];
  collaborations: Collaboration[] = [];

  activeRace: number = 1;
  isEditMode: boolean = false;
  editingSelections: Selection[] = [];

  protected readonly COLORS = COLORS;
  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly SENIOR_HORSE_AGE = SENIOR_HORSE_AGE;
  protected readonly COMMON_HORSE_ORIGINS = COMMON_HORSE_ORIGINS;
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
    socket.addPickCallback((newPick: Pick) => {
      if (this.pick != newPick) this.pick = newPick;
    });

    socket.addRacecardCallback((newCard: Racecard) => {
      const oldCard = this.racecards
        .find(r => r.meeting === newCard.meeting && r.race === newCard.race);

      if (oldCard) {
        if (oldCard.time != newCard.time) oldCard.time = newCard.time;
        if (oldCard.starters != newCard.starters) oldCard.starters = newCard.starters;
        if (oldCard.changes != newCard.changes) oldCard.changes = newCard.changes;
        if (oldCard.pool != newCard.pool) oldCard.pool = newCard.pool;
        if (oldCard.odds != newCard.odds) oldCard.odds = newCard.odds;
        if (oldCard.signal != newCard.signal) oldCard.signal = newCard.signal;
        if (oldCard.dividend != newCard.dividend) oldCard.dividend = newCard.dividend;
      }
    });

    socket.addMeetingCallback((newMeeting: Meeting) => {
      const index = this.meetings.findIndex(m => m.meeting === newMeeting.meeting);
      if (index === -1) this.meetings.unshift(newMeeting);
      else this.meetings.splice(index, 1, newMeeting);
    });

    socket.addCollaborationCallback((newCollaboration: Collaboration) => {
      const index = this.collaborations.findIndex(c =>
        c.jockey === newCollaboration.jockey && c.trainer === newCollaboration.trainer
      );
      if (index === -1) this.collaborations.push(newCollaboration);
      else this.collaborations.splice(index, 1, newCollaboration);
    });
  }

  ngOnInit(): void {
    this.repo.fetchPick(() => {
      this.pick = this.repo.findPick();
    });

    this.repo.fetchRacecards('latest', () => {
      this.racecards = this.repo.findRacecards();
    });

    this.repo.fetchMeetings(8, () => {
      this.meetings = this.repo.findMeetings();
    });

    this.repo.fetchMeetingCollaborations('latest', () => {
      this.collaborations = this.repo.findCollaborations();
    });

    this.repo.fetchMeetingHorses();
  }

  formatVenue = (venue: string): string =>
    ['HV', 'ST'].includes(venue) ? venue : 'OS'

  formatPlayer = (player: string): string =>
    player.length <= 3
      ? player
      : player.split(' ')[1].slice(0, 3).toUpperCase()

  formatMeeting = (meeting: string): string => {
    const pastMeeting = new Date(meeting).getTime();
    const currentMeeting = new Date(this.racecards[0].meeting).getTime();
    const diffDays = (currentMeeting - pastMeeting) / ONE_DAY_MILL;
    const diffMonths = (diffDays / 30).toFixed(1);
    const diffYears = (diffDays / 365).toFixed(1);

    if (diffDays < 30) return `${diffDays}D`;
    if (diffDays < 365) return `${diffMonths}M`;
    return `${diffYears}Y`;
  }

  clickRaceBadge = (clickedRace: number) => {
    if (!this.isEditMode) this.activeRace = clickedRace;
  }

  clickEditButton = () => {
    if (!this.isEditMode) {
      this.isEditMode = true;
      const selections = this.pick.races
        .find(r => r.race === this.activeRace)?.selections || [];
      this.editingSelections = [...selections];

    } else {
      this.isEditMode = false;
      let newPick: Pick = {...this.pick, races: [...this.pick.races]};
      let newRacePick = newPick.races.find(r => r.race === this.activeRace);
      if (!newRacePick) return;

      newRacePick.selections = this.editingSelections;
      this.repo.savePick(newPick);
    }
  }

  toggleFavorite = (starter: Starter) => {
    if (this.pick.meeting !== this.racecards[0].meeting) return;

    const order = starter.order;
    const favorites = this.pick.races.find(r => r.race === this.activeRace)?.favorites || [];
    let newFavorites = [...favorites];

    if (favorites.includes(order)) newFavorites = newFavorites.filter(f => f !== order);
    else newFavorites.push(order);

    let newPick: Pick = {...this.pick, races: [...this.pick.races]};
    let newRacePick = newPick.races.find(r => r.race === this.activeRace);
    if (!newRacePick) return;

    newRacePick.favorites = newFavorites;
    this.repo.savePick(newPick);
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
        : (this.pick.races.find(r => r.race === this.activeRace)?.selections || [])
    )
      .some(s => s.order === starter.order && s.placing === placing)

  isFavorite = (starter: Starter): boolean =>
    this.pick.races
      .filter(r => r.race === this.activeRace)
      .some(r => r.favorites.includes(starter.order));

  getSelectionCellColor = (starter: Starter, placing: number): string => {
    if (this.isSelection(starter, placing)) return '';
    return this.isEditMode ? 'opacity-25' : 'opacity-0';
  }

  getHorse = (starter: Starter): Horse =>
    this.repo.findHorses()
      .find(s => s.code === starter.horse) || DEFAULT_HORSE

  getCollaborationStats = (starter: Starter): number[] => {
    const partnerships = (
      this.collaborations
        .filter(c => c.jockey === starter.jockey && c.trainer === starter.trainer)
        .pop()
        ?.starters || []
    )
      .filter(s => !s.scratched)
      .filter(s => {
        if (s.meeting !== this.racecards[0].meeting) return true;
        return s.meeting === this.racecards[0].meeting && s.race < this.activeRace;
      });

    const placingCount = Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(placing => partnerships.filter(p => (p?.placing || 0) === placing).length);

    return placingCount.concat(partnerships.length);
  }

  getHorseStatistics = (starter: Starter): string => {
    const h = this.getHorse(starter);
    return `${h.total1st}-${h.total2nd}-${h.total3rd}/${h.totalRuns}`;
  }

  getPastHorseStarters = (current: Starter): PastStarter[] =>
    (this.repo.findHorses().find(s => s.code === current.horse)?.pastStarters || []).slice(0, 20)

  getPastCollaborationStarters = (current: Starter): CollaborationStarter[] =>
    (
      this.collaborations
        .filter(c => c.jockey === current.jockey && c.trainer === current.trainer)
        .pop()
        ?.starters || []
    )
      .filter(s => {
        if (s.meeting !== this.racecards[0].meeting) return true;
        return s.meeting === this.racecards[0].meeting && s.race < this.activeRace;
      })
      .sort((r1, r2) =>
        r2.meeting.localeCompare(r1.meeting) || r2.race - r1.race
      )
      .slice(0, 35)

  getActiveStarterWQPInvestments =
    (starter: Starter): Array<{ percent: string, amount: string }> => {

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

  getPlayerStarters = (player: string): EarningStarter[] =>
    this.meetings
      .filter(m => m.players.some(p => p.player === player))
      .flatMap(m => m.players.map(p => {
        p.meeting = m.meeting;
        return p;
      }))
      .filter(ps => ps.player === player)
      .flatMap(ps => ps.starters.map(s => {
        s.meeting = ps.meeting;
        return s;
      }))
      .filter(s => {
        if (s.meeting !== this.racecards[0].meeting) return true;
        return s.meeting === this.racecards[0].meeting && s.race < this.activeRace;
      })
      .sort((s1, s2) => s2.meeting.localeCompare(s1.meeting) || s2.race - s1.race)
      .slice(0, 20)

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

  get startersSortedByChance(): Starter[] {
    return this.activeRacecard.starters
      .filter(s => !s.scratched)
      .sort((s1, s2) =>
        ((s2?.chance || 0) - (s1?.chance || 0))
        ||
        (s1.order - s2.order)
      );
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get isLoading(): boolean {
    return this.pick.races.length === 0
      || this.racecards.length === 0
      || this.meetings.length === 0
      || this.collaborations.length === 0
      || this.repo.findHorses().length === 0;
  }
}
