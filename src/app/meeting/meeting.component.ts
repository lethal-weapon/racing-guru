import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../websocket.service';
import {RestRepository} from '../model/rest.repository';
import {DEFAULT_PICK, Pick} from '../model/pick.model';
import {Player} from '../model/player.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {DEFAULT_MEETING, Meeting} from '../model/meeting.model';
import {ChallengeOdds, DEFAULT_CHALLENGE_ODDS} from '../model/odds.model';
import {DEFAULT_COMBINATIONS, DEFAULT_SINGULARS} from '../model/dividend.model';
import {BOUNDARY_POOLS, RATING_GRADES} from '../util/strings';
import {EARNING_THRESHOLD, PAYOUT_RATE, THREE_SECONDS} from '../util/numbers';
import {
  getHorseProfileUrl,
  getOddsIntensityColor,
  getStarter,
  getStarterWinPlaceOdds,
  getTrainer,
  getWinPlaceOdds,
  toMillion,
  toPlacingColor
} from '../util/functions';

interface DividendPool {
  name: string,
  threshold: number
}

interface HorseDetail {
  name: string,
  order: number,
  odds: number,
  jockey: string,
  trainer: string
}

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html'
})
export class MeetingComponent implements OnInit {
  pick: Pick = DEFAULT_PICK;
  meeting: Meeting = DEFAULT_MEETING;
  racecards: Racecard[] = [];

  activeDraw: number = 0;
  remainingTime: string = '---';

  activeTrainer: string = '';
  activeTrainerIntervalId: any;
  activeTrainerAnimationOn: boolean = false;

  protected readonly RATING_GRADES = RATING_GRADES;
  protected readonly BOUNDARY_POOLS = BOUNDARY_POOLS;
  protected readonly EARNING_THRESHOLD = EARNING_THRESHOLD;
  protected readonly toPlacingColor = toPlacingColor;
  protected readonly getStarter = getStarter;
  protected readonly getTrainer = getTrainer;
  protected readonly getWinPlaceOdds = getWinPlaceOdds;
  protected readonly getHorseProfileUrl = getHorseProfileUrl;
  protected readonly getOddsIntensityColor = getOddsIntensityColor;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService
  ) {
    socket.addPickCallback((newPick: Pick) => {
      if (this.pick != newPick) this.pick = newPick;
    });

    socket.addMeetingCallback((newMeeting: Meeting) => {
      if (this.meeting.meeting === newMeeting.meeting) {
        this.meeting = newMeeting;
      }
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
  }

  ngOnInit(): void {
    this.repo.fetchPick(() => {
      this.pick = this.repo.findPick();
    });

    this.repo.fetchLatestMeeting(() => {
      this.meeting = this.repo.findMeetings()[0];
    });

    this.repo.fetchRacecards('latest', () => {
      this.racecards = this.repo.findRacecards();
    });

    setInterval(() => this.tick(), THREE_SECONDS);
    this.repo.fetchActivePlayers();
    this.repo.fetchMeetingHorses();
  }

  setActiveDraw = (clicked: number) =>
    this.activeDraw = this.activeDraw === clicked ? 0 : clicked

  tick = () => {
    if (!this.next) {
      this.remainingTime = `---`;
      return;
    }

    const raceTime = new Date(this.next.time).getTime();
    const currTime = new Date().getTime();
    const diff = Math.floor((raceTime - currTime) / 1000);

    if (diff <= 600) this.remainingTime = `${diff} sec`;
    else if (diff <= 5_400) this.remainingTime = `${Math.floor(diff / 60)} min`;
    else if (diff <= 36_000) this.remainingTime = `${(diff / 3600).toFixed(1)} hrs`;
    else this.remainingTime = `${Math.floor(diff / 3600)} hrs`;

    let audioName = '';
    if (diff >= 899 && diff <= 901) audioName = '15-min-horse';
    else if (diff >= 599 && diff <= 601) audioName = '10-min-door';
    else if (diff >= 299 && diff <= 301) audioName = '5-min-rooster';
    else if (diff >= 179 && diff <= 181) audioName = '3-min-instrument';
    else if (diff >= 59 && diff <= 61) audioName = '1-min-alarm';

    if (audioName.length > 0) {
      let audio = new Audio(`../../assets/audio/${audioName}.wav`);
      audio.load();
      audio.play();
    }
  }

  toggleActiveTrainer = (clicked: string) => {
    if (this.activeTrainer === clicked) {
      if (this.activeTrainerIntervalId) {
        clearInterval(this.activeTrainerIntervalId);
        this.activeTrainerIntervalId = null;
      }
      this.activeTrainer = '';
      this.activeTrainerAnimationOn = false;

    } else {
      this.activeTrainer = clicked;
      this.activeTrainerAnimationOn = true;
      if (!this.activeTrainerIntervalId) {
        this.activeTrainerIntervalId = setInterval(() => {
          this.activeTrainerAnimationOn = !this.activeTrainerAnimationOn;
        }, 500);
      }
    }
  }

  toggleFavorite = (starter: Starter, racecard: Racecard) => {
    if (this.pick.meeting !== this.racecards[0].meeting) return;

    const order = starter.order;
    const race = racecard.race;
    const favorites = this.pick.races.find(r => r.race === race)?.favorites || [];
    let newFavorites = [...favorites];

    if (favorites.includes(order)) newFavorites = newFavorites.filter(f => f !== order);
    else newFavorites.push(order);

    let newPick: Pick = {...this.pick, races: [...this.pick.races]};
    let newRacePick = newPick.races.find(r => r.race === race);
    if (!newRacePick) return;

    newRacePick.favorites = newFavorites;
    this.repo.savePick(newPick);
  }

  getMeetingEarning = (player: string): number =>
    this.meeting.players.find(p => p.player === player)?.earnings || 0

  isPersonalFavorite = (starter: Starter, race: number): boolean =>
    this.pick.races
      .filter(r => r.race === race)
      .some(r => r.favorites.includes(starter.order))

  isUpcomingRacePublicFavorite = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race < this.nextRace) return false;
    return this.isPublicFavorite(jockey, racecard);
  }

  isPublicFavorite = (jockey: string, racecard: Racecard): boolean => {
    if (!racecard.odds) return false;

    const order = getStarter(jockey, racecard).order;
    const favouredOrder = racecard.odds.winPlace
      .map(o => o)
      .sort((o1, o2) => o1.win - o2.win)
      .shift()
      ?.order;

    return order === favouredOrder;
  }

  isTrainerFinalRace = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race === this.maxRace) return false;

    const trainer = getTrainer(jockey, racecard);
    return racecard.race === this.racecards
      .filter(r => r.starters.map(s => s.trainer).includes(trainer))
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2)
      .pop();
  }

  isTrainerHasNoStarterNextRace = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race >= this.maxRace - 1) return false;
    if (this.isTrainerFinalRace(jockey, racecard)) return false;

    const next = racecard.race + 1;
    const trainer = getTrainer(jockey, racecard);

    return !this.racecards
      .find(r => r.race === next)
      ?.starters
      .map(s => s.trainer)
      .includes(trainer);
  }

  hideBottomBorder = (jockey: string, racecard: Racecard): boolean =>
    !(
      racecard.race === this.lastRace
      || racecard.race === this.maxRace
      || this.rideThisRace(jockey, racecard)
      || this.rideNextRace(jockey, racecard)
    )

  hideRightBorder = (jockey: string, racecard: Racecard): boolean =>
    !(
      jockey === this.jockeys.pop()
      || this.isBoundaryPlayer(jockey, true)
      || this.rideThisRace(jockey, racecard)
      || this.rideThisRace(this.jockeys[this.jockeys.indexOf(jockey) + 1], racecard)
    )

  rideThisRace = (jockey: string, racecard: Racecard): boolean =>
    racecard.starters.map(s => s.jockey).includes(jockey);

  rideNextRace = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race >= this.maxRace) return false;

    const nextRacecard =
      this.racecards.filter(r => r.race === racecard.race + 1).pop();

    // @ts-ignore
    return this.rideThisRace(jockey, nextRacecard);
  }

  isSpecialRace = (race: Racecard): boolean =>
    !(
      race.track === 'TURF'
      && race.grade.startsWith('C')
      && race.distance > 1000
      && (!race.name.includes('JUG'))
      && (!race.name.includes('CUP'))
      && (!race.name.includes('PLATE'))
      && (!race.name.includes('TROPHY'))
      && (!race.name.includes('CHALLENGE'))
      && (!race.name.includes('CHAMPIONSHIP'))
      && (
        race.grade.endsWith('3')
        || race.grade.endsWith('4')
        || race.grade.endsWith('5')
      )
    )

  isBoundaryPlayer = (player: string, jockey: boolean): boolean => {
    let specials = [];
    let players = jockey ? this.jockeys : this.trainers;
    let allPlayers = jockey ? this.allJockeys : this.allTrainers;
    let boundaryPlayers = jockey ? this.boundaryJockeys : this.boundaryTrainers;

    for (const p of boundaryPlayers) {
      if (players.includes(p)) {
        if (players.indexOf(p) !== players.length - 1) {
          specials.push(p);
        }
      } else {
        let priorIndex = allPlayers.indexOf(p);
        let priorPlayer = p;
        while (!players.includes(priorPlayer) && priorIndex > 0) {
          priorIndex -= 1;
          priorPlayer = allPlayers[priorIndex];
        }
        specials.push(priorPlayer);
      }
    }

    return specials.includes(player);
  }

  formatChallengeOdds = (odds: number): string => {
    if (odds < 1) return '';
    else if (odds > 99) return '99+'
    else return `${odds}`;
  }

  formatRaceGrade = (grade: string): string => {
    const clean = grade
      .replace('(', '')
      .replace(')', '')
      .replace('RESTRICTED', '')
      .replace('4 YEAR OLDS', '4Y')
      .replace('GRIFFIN RACE', 'GF')
      .replace('GRIFFIN', 'GF')
      .trim();
    return `${clean[0]}${clean.slice(-1)}`
  }

  getStarterTooltip = (jockey: string, racecard: Racecard): string => {
    const starter = racecard.starters.find(s => s.jockey === jockey);
    if (!starter) return '';

    const horse = this.repo.findHorses().find(h => h.code === starter.horse);
    if (!horse) return '';

    return `
      <div class="w-44 text-center">
        <div>${horse.nameCH}</div>
        <div>${horse.nameEN}</div>
      </div>
    `;
  }

  getRaceTooltip = (racecard: Racecard): string => {
    const name = racecard.name
      .replace('(', '')
      .replace(')', '')
      .replace('HANDICAP', '')
      .replace('CHINESE NEW YEAR', 'CNY')
      .replace('INTERNATIONAL JOCKEYS\' CHAMPIONSHIP', 'IJC')
      .replace(/\d{4}M/g, '')
      .trim();

    const dt = new Date(racecard.time);
    let time = `${dt.getHours()} : ${dt.getMinutes()}`;
    if (dt.getMinutes() === 0) time += '0';
    else if (dt.getMinutes() < 10) {
      time = `${dt.getHours()} : 0${dt.getMinutes()}`;
    }

    let track = racecard.track.toUpperCase();
    if (track !== 'TURF') track = 'AWT';
    const trackColor = track === 'TURF' ? 'text-green-600' : 'text-orange-400';

    const prize = `$${toMillion(racecard.prize)}M`;

    return `
      <div class="w-44">
        <div class="text-center">${name}</div>
        <div class="flex flex-row justify-evenly">
          <div class="text-red-600">${time}</div>
          <div class="${trackColor}">${track}</div>
          <div class="text-yellow-400">${prize}</div>
        </div>
      </div>
    `;
  }

  getDividendOdds = (race: number, pool: string): number => {
    const d = this.racecards.find(r => r.race === race)?.dividend;
    try {
      switch (pool) {
        case 'WIN':
          return (d?.win || DEFAULT_SINGULARS)[0].odds
        case 'QIN':
          return Math.floor((d?.quinella || DEFAULT_COMBINATIONS)[0].odds)
        case 'FCT':
          return Math.floor((d?.forecast || DEFAULT_COMBINATIONS)[0].odds)
        case 'TRI':
          return Math.floor((d?.trio || DEFAULT_COMBINATIONS)[0].odds)
        case 'F-F':
          return Math.floor((d?.firstFour || DEFAULT_COMBINATIONS)[0].odds)
        case 'TCE':
          return Math.floor((d?.tierce || DEFAULT_COMBINATIONS)[0].odds)
        case 'QTT':
          return Math.floor((d?.quartet || DEFAULT_COMBINATIONS)[0].odds)

        case 'PLA-1':
          return (d?.place || DEFAULT_SINGULARS)[0].odds
        case 'PLA-2':
          return (d?.place || DEFAULT_SINGULARS)[1].odds
        case 'PLA-3':
          return (d?.place || DEFAULT_SINGULARS)[2].odds

        case 'QPL-1':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[0].odds.toFixed(1))
        case 'QPL-2':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[1].odds.toFixed(1))
        case 'QPL-3':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[2].odds.toFixed(1))

        case 'DBL-1':
          return Math.floor((d?.doubles || DEFAULT_COMBINATIONS)[0].odds)
        case 'DBL-2':
          return (d?.doubles || DEFAULT_COMBINATIONS)[1].odds

        case 'TBL-1':
          return Math.floor((d?.treble || DEFAULT_COMBINATIONS)[0].odds)
        case 'TBL-2':
          return Math.floor((d?.treble || DEFAULT_COMBINATIONS)[1].odds)

        case '6UP-1':
          return Math.floor((d?.sixUp || DEFAULT_COMBINATIONS)[0].odds)
        case '6UP-2':
          return Math.floor((d?.sixUp || DEFAULT_COMBINATIONS)[1].odds)

        case 'D-T':
          return Math.floor((d?.doubleTrio || DEFAULT_COMBINATIONS)[0].odds)
        case 'TT-1':
          return Math.floor((d?.tripleTrio || DEFAULT_COMBINATIONS)[0].odds)
        case 'TT-2':
          return Math.floor((d?.tripleTrio || DEFAULT_COMBINATIONS)[1].odds)

        default:
          return 0
      }
    } catch (e) {
      return 0;
    }
  }

  getDividendTop4 = (race: number): string[] => {
    const starters = this.racecards
        .find(r => r.race === race)
        ?.starters
        .filter(s => (s?.placing || 0) >= 1 && (s?.placing || 0) <= 4)
        .sort((s1, s2) => (s1.placing - s2.placing) || (s1.order - s2.order))
      || [];

    if (starters.length === 0) return [];

    return Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(p => starters
        .filter(s => s.placing === p)
        .map(s => s.order)
        .join('/'));
  }

  getHorseDetail = (horse: string, race: number): HorseDetail => ({
    name: this.repo.findHorses().find(h => h.code === horse)?.nameCH || '?',
    order: this.starters.find(s => s.horse === horse)?.order || 0,
    odds: getWinPlaceOdds(
      this.starters.find(s => s.horse === horse)?.jockey || '',
      // @ts-ignore
      this.racecards.find(r => r.race === race)
    ).win,
    jockey: this.starters.find(s => s.horse === horse)?.jockey || '?',
    trainer: this.starters.find(s => s.horse === horse)?.trainer || '?'
  })

  getTrainerGroup = (groupIndex: number): string[] => {
    let startIndex = 0;
    if (groupIndex > 0) {
      startIndex = 1 + this.allTrainers
        .findIndex(p => p === this.boundaryTrainers[groupIndex - 1]);
    }

    let endIndex = groupIndex < this.boundaryTrainers.length
      ? this.allTrainers.findIndex(p => p === this.boundaryTrainers[groupIndex])
      : this.allTrainers.length - 1;

    return this.allTrainers.filter((_, i) => i >= startIndex && i <= endIndex);
  }

  getStartersByTrainerGroup = (race: number, groupIndex: number): Starter[] => {
    // @ts-ignore
    return this.getTrainerGroup(groupIndex)
      .filter(t => this.racecards
        .find(r => r.race === race)
        ?.starters
        .map(s => s.trainer)
        .includes(t)
      )
      .map(t =>
        this.racecards
          .find(r => r.race === race)
          ?.starters
          .filter(s => s.trainer === t)
          .sort((s1, s2) => s1.order - s2.order)
      )
      .flatMap(s => s);
  }

  getChallengerInvestment = (challenger: string): number =>
    this.racecards
      .map(r => r.starters
        .filter(s => s.jockey === challenger || s.trainer === challenger)
        .map(s => getStarterWinPlaceOdds(s, r).win)
        .filter(wo => wo && wo > 0)
        .map(wo => PAYOUT_RATE / wo)
        .reduce((prev, curr) => prev + curr, 0)
      )
      .reduce((prev, curr) => prev + curr, 0)

  getOutsiderChallengerInvestment = (personType: string): number => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => o.outsider)
      .map(o => this.getChallengerInvestment(o.challenger))
      .reduce((prev, curr) => prev + curr, 0);
  }

  getChallengeOdds = (personType: string, order: number): ChallengeOdds => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return DEFAULT_CHALLENGE_ODDS;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => !o.outsider)
      ?.find(o => o.order === order) || DEFAULT_CHALLENGE_ODDS;
  }

  getOutsiderChallengeOdds = (personType: string): ChallengeOdds => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return DEFAULT_CHALLENGE_ODDS;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.find(o => o.outsider) || DEFAULT_CHALLENGE_ODDS;
  }

  isTopChallengePoint = (personType: string, order: number): boolean => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return false;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => o.points > 0)
      .map(o => o.points)
      .filter((p, index, arr) => index === arr.indexOf(p))
      .sort((p1, p2) => p2 - p1)
      .slice(0, 3)
      .includes(this.getChallengeOdds(personType, order).points);
  }

  get singleRacePools(): DividendPool[] {
    return [
      {name: 'WIN', threshold: 8},
      {name: 'QIN', threshold: 40},
      {name: 'FCT', threshold: 80},
      {name: 'TRI', threshold: 100},
      {name: 'F-F', threshold: 100},
      {name: 'TCE', threshold: 300},
      {name: 'QTT', threshold: 3000},
      {name: 'PLA-1', threshold: 4},
      {name: 'PLA-2', threshold: 4},
      {name: 'PLA-3', threshold: 4},
      {name: 'QPL-1', threshold: 15},
      {name: 'QPL-2', threshold: 15},
      {name: 'QPL-3', threshold: 15},
      {name: 'DBL-1', threshold: 50},
      {name: 'DBL-2', threshold: 20},
    ];
  }

  get crossRacePools(): DividendPool[] {
    return [
      {name: 'TBL-1', threshold: 100},
      {name: 'TBL-2', threshold: 40},
      {name: '6UP-1', threshold: 300},
      {name: '6UP-2', threshold: 3000},
      {name: 'D-T', threshold: 3000},
      {name: 'TT-1', threshold: 10000},
      {name: 'TT-2', threshold: 1000},
    ];
  }

  get crossRacePoolDividendNumbers(): number[] {
    return this.racecards
      .filter(r =>
        r?.dividend?.treble
        ||
        r?.dividend?.sixUp
        ||
        r?.dividend?.doubleTrio
        ||
        r?.dividend?.tripleTrio
      )
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2);
  }

  get pools(): Array<{ pool: string, amount: string }> {
    const pool = (this.next || this.racecards[this.racecards.length - 1])?.pool;
    return [
      {pool: 'W', amount: toMillion(pool?.win || 0)},
      {pool: 'Q', amount: toMillion(pool?.quinella || 0)},
      {pool: 'FCT', amount: toMillion(pool?.forecast || 0)},
      {pool: 'FQ', amount: toMillion(pool?.quartet || 0)},
      {pool: 'P', amount: toMillion(pool?.place || 0)},
      {pool: 'QP', amount: toMillion(pool?.quinellaPlace || 0)},
      {pool: 'TCE', amount: toMillion(pool?.tierce || 0)},
      {pool: 'DBL', amount: toMillion(pool?.doubles || 0)},
    ];
  }

  get summary(): string[] {
    const racecard = this.racecards.find(r => r.race === 1);
    if (!racecard) return [];

    const date = racecard.meeting;
    const venue = racecard.venue;
    const course = this.racecards.find(r => r.course)?.course || 'AWT';
    const races = this.racecards.length;
    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', {weekday: 'short'})
      .toUpperCase();

    const horses = this.starters.length;
    const jockeys = this.jockeys.length;
    const trainers = this.trainers.length;

    return [
      `${dayOfWeek}, ${date}, ${venue}, ${course} Course`,
      `${races} Races, ${jockeys} Jockeys, ${trainers} Trainers, ${horses} Horses`
    ];
  }

  get maxChallengerOrder(): number {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return [...odds?.jkc, ...odds?.tnc]
      .filter(o => !o.outsider)
      .map(o => o.order)
      .sort((o1, o2) => o1 - o2)
      .pop() || 0;
  }

  get starters(): Starter[] {
    return this.racecards.flatMap(r => r.starters);
  }

  get jockeys(): string[] {
    const meetingJockeys = new Set(this.starters.map(s => s.jockey));
    return this.allJockeys.filter(j => meetingJockeys.has(j));
  }

  get trainers(): string[] {
    const meetingTrainers = new Set(this.starters.map(s => s.trainer));
    return this.allTrainers.filter(t => meetingTrainers.has(t));
  }

  get boundaryJockeys(): string[] {
    return this.players.filter(p => p.jockey && p.boundary).map(j => j.code);
  }

  get boundaryTrainers(): string[] {
    return this.players.filter(p => !p.jockey && p.boundary).map(j => j.code);
  }

  get allJockeys(): string[] {
    return this.players.filter(p => p.jockey).map(j => j.code);
  }

  get allTrainers(): string[] {
    return this.players.filter(p => !p.jockey).map(j => j.code);
  }

  get players(): Player[] {
    return this.repo.findPlayers();
  }

  get maxRace(): number {
    return this.racecards.map(r => r.race).pop() || 0;
  }

  get lastRace(): number {
    return this.nextRace - 1;
  }

  get nextRace(): number {
    return this.next?.race || 13;
  }

  get next(): Racecard | undefined {
    return this.racecards.filter(r => !r.dividend?.win)[0];
  }

  get isLoading(): boolean {
    return this.pick.races.length === 0
      || this.meeting.players.length === 0
      || this.racecards.length === 0
      || this.repo.findPlayers().length === 0
      || this.repo.findHorses().length === 0;
  }
}
