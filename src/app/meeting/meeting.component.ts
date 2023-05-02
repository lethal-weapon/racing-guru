import {Component, OnInit} from '@angular/core';

import {Racecard} from '../model/racecard.model';
import {WebsocketService} from '../model/websocket.service';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {Starter} from '../model/starter.model';
import {RestRepository} from '../model/rest.repository';
import {WinPlaceOdds} from '../model/order.model';
import {ONE_MILLION, THREE_SECONDS} from '../util/numbers';
import {BOUNDARY_JOCKEYS} from '../util/persons';
import {getHorseProfileUrl, toMillion} from '../util/functions';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html'
})
export class MeetingComponent implements OnInit {
  racecards: Racecard[] = [];

  remainingTime: string = '---';
  activeTrainer: string = '';
  activeDraw: number = 0;

  protected readonly getHorseProfileUrl = getHorseProfileUrl;

  constructor(
    private socket: WebsocketService,
    private repo: RestRepository
  ) {
    socket.racecards.subscribe(data => this.racecards = data);
  }

  ngOnInit(): void {
    setInterval(() => {
      this.socket.racecards.next([]);
      this.tick();
    }, THREE_SECONDS);
  }

  setActiveTrainer = (clicked: string) =>
    this.activeTrainer = this.activeTrainer === clicked ? '' : clicked

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

    if (diff <= 999) this.remainingTime = `${diff} sec`
    else if (diff <= 7200) this.remainingTime = `${Math.floor(diff / 60)} min`
    else this.remainingTime = `${Math.floor(diff / 3600)} hrs`
  }

  toggleFavorite = (starter: Starter, racecard: Racecard) => {
    const order = starter.order;
    let favorites = racecard.favorites.map(f => f);

    if (favorites.includes(order)) {
      favorites = favorites.filter(f => f !== order)
    } else {
      favorites.push(order)
    }

    this.repo.saveFavorite({
      meeting: this.currentMeeting,
      race: racecard.race,
      favorites: favorites
    });
  }

  isPersonalFavorite(starter: Starter, racecard: Racecard): boolean {
    return racecard.favorites.includes(starter.order);
  }

  isHighlightEarning(jockey: string): boolean {
    return this.getMeetingEarning(jockey) >= 12;
  }

  isComingFavoured(jockey: string, racecard: Racecard): boolean {
    if (racecard.race < this.nextRace) return false;
    return this.isPublicFavorite(jockey, racecard);
  }

  isPublicFavorite(jockey: string, racecard: Racecard): boolean {
    if (!racecard.odds) return false;

    const order = this.getStarter(jockey, racecard).order;
    // @ts-ignore
    const favouredOrder = racecard.odds.winPlace
      .map(o => o)
      .sort((o1, o2) => o1.win - o2.win)
      .shift()
      .order;

    return order === favouredOrder;
  }

  getMeetingEarning(jockey: string): number {
    return parseFloat(
      this.racecards
        .filter(r => this.getPlacing(jockey, r) > 0)
        .map(r => this.getRaceEarning(jockey, r))
        .reduce((prev, curr) => prev + curr, 0)
        .toFixed(1)
    );
  }

  getRaceEarning(jockey: string, racecard: Racecard): number {
    const placing = this.getPlacing(jockey, racecard);
    const odds = this.getWinPlaceOdds(jockey, racecard);
    const order = odds.order;

    if ([1, 2, 3].includes(placing)) {
      const win = racecard.dividend?.win?.filter(w => w.order === order).pop();
      const pla = racecard.dividend?.place?.filter(p => p.order === order).pop();
      if (placing === 1) return win?.odds || 0;
      if (placing === 2) return (pla?.odds || 0) + (odds.win / 10);
      return pla?.odds || (odds.win / 10);
    }

    return placing === 4 ? odds.win / 10 : 0;
  }

  getPlacing(jockey: string, racecard: Racecard): number {
    const tierce = racecard?.dividend?.tierce;
    const quartet = racecard?.dividend?.quartet;
    if (!tierce) return 0;

    let orders = tierce[0].orders;
    if (quartet) orders = quartet[0].orders;

    const order = this.getStarter(jockey, racecard)?.order;
    if (!orders.includes(order)) return 0;
    return orders.indexOf(order) + 1;
  }

  getPlacingColor(jockey: string, racecard: Racecard): string {
    const placing = this.getPlacing(jockey, racecard);
    const colors = [
      'text-red-600', 'text-green-600',
      'text-blue-600', 'text-purple-600',
    ];
    return placing > 0 ? colors[placing - 1] : '';
  }

  getWinPlaceOdds(jockey: string, racecard: Racecard): WinPlaceOdds {
    const order = this.getStarter(jockey, racecard).order;
    const defaultValue = {order: order, win: 0, place: 0};
    if (!racecard.odds) return defaultValue;

    return racecard.odds.winPlace
      .filter(o => o.order === order)
      .pop() || defaultValue;
  }

  getTrainer(jockey: string, racecard: Racecard): string {
    return this.getStarter(jockey, racecard).trainer;
  }

  getStarter(jockey: string, racecard: Racecard): Starter {
    // @ts-ignore
    return racecard.starters.filter(s => s.jockey === jockey).pop();
  }

  isTrainerLastRace(jockey: string, racecard: Racecard): boolean {
    if (racecard.race === this.maxRace) return false;

    const trainer = this.getTrainer(jockey, racecard);
    return racecard === this.racecards
      .filter(r => r.starters.map(s => s.trainer).includes(trainer))
      .pop();
  }

  emphasiseTrainer(jockey: string, racecard: Racecard): boolean {
    if (racecard.race >= this.maxRace - 1) return false;
    if (this.isTrainerLastRace(jockey, racecard)) return false;

    const next = racecard.race + 1;
    const trainer = this.getTrainer(jockey, racecard);

    // @ts-ignore
    return !this.racecards
      .filter(r => r.race === next)
      .pop()
      .starters
      .map(s => s.trainer)
      .includes(trainer);
  }

  hideBottomBorder(jockey: string, racecard: Racecard): boolean {
    return !(
      racecard.race === this.lastRace
      || racecard.race === this.maxRace
      || this.rideThisRace(jockey, racecard)
      || this.rideNextRace(jockey, racecard)
    )
  }

  hideRightBorder(jockey: string, racecard: Racecard): boolean {
    return !(
      jockey === this.jockeys.pop()
      || this.isBoundaryJockey(jockey)
      || this.rideThisRace(jockey, racecard)
      || this.rideThisRace(this.jockeys[this.jockeys.indexOf(jockey) + 1], racecard)
    )
  }

  rideThisRace(jockey: string, racecard: Racecard): boolean {
    return racecard.starters.map(s => s.jockey).includes(jockey);
  }

  rideNextRace(jockey: string, racecard: Racecard): boolean {
    if (racecard.race >= this.maxRace) return false;

    const nextRacecard =
      this.racecards.filter(r => r.race === racecard.race + 1).pop();

    // @ts-ignore
    return this.rideThisRace(jockey, nextRacecard);
  }

  isSpecialRace(race: Racecard): boolean {
    return !(
      race.track === 'Turf'
      && race.grade.startsWith('C')
      && race.distance > 1000
      && (!race.name.includes('CUP'))
      && (!race.name.includes('TROPHY'))
      && (!race.name.includes('CHAMPIONSHIP'))
      && (
        race.grade.endsWith('3')
        || race.grade.endsWith('4')
        || race.grade.endsWith('5')
      )
    )
  }

  isBoundaryJockey(jockey: string): boolean {
    let specials = []
    for (const j of BOUNDARY_JOCKEYS) {
      if (this.jockeys.includes(j)) {
        if (this.jockeys.indexOf(j) !== this.jockeys.length - 1) {
          specials.push(j);
        }
      } else {
        let priorIndex = JOCKEYS.map(j => j.code).indexOf(j);
        let priorJockey = j;
        while (!this.jockeys.includes(priorJockey) && priorIndex > 0) {
          priorIndex -= 1;
          priorJockey = JOCKEYS[priorIndex].code;
        }
        specials.push(priorJockey);
      }
    }
    return specials.includes(jockey);
  }

  formatRaceGrade(grade: string): string {
    const clean = grade
      .replace('(', '')
      .replace(')', '')
      .replace('RESTRICTED', '')
      .replace('4 YEAR OLDS', '4Y')
      .replace('GRIFFIN RACE', 'GF')
      .trim();
    return `${clean[0]}${clean.slice(-1)}`
  }

  getStarterTooltip(jockey: string, racecard: Racecard): string {
    const starter = racecard.starters.filter(s => s.jockey === jockey).pop();
    if (!starter) return '';
    return `
      <div class="w-44 text-center">
        <div>${starter.horseNameCH}</div>
        <div>${starter.horseNameEN}</div>
      </div>
    `;
  }

  getRaceTooltip(racecard: Racecard): string {
    const name = racecard.name
      .replace('(', '')
      .replace(')', '')
      .replace('HANDICAP', '')
      .replace('CHINESE NEW YEAR', 'CNY')
      .replace('INTERNATIONAL JOCKEYS\' CHAMPIONSHIP', 'IJC')
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

    const prize = `$${(racecard.prize / ONE_MILLION).toFixed(2)}M`;

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

  get pools(): Array<{ pool: string, amount: string }> {
    // @ts-ignore
    const pool = (this.next || this.racecards[this.racecards.length - 1])?.pool;
    if (!pool) return [];

    return [
      {pool: 'W', amount: toMillion(pool.win)},
      {pool: 'Q', amount: toMillion(pool.quinella)},
      {pool: 'FT', amount: toMillion(pool.forecast)},
      {pool: 'TCE', amount: toMillion(pool.tierce)},
      {pool: 'P', amount: toMillion(pool.place)},
      {pool: 'QP', amount: toMillion(pool?.quinellaPlace || 0)},
      {pool: 'FQ', amount: toMillion(pool?.quartet || 0)},
      {pool: 'DBL', amount: toMillion(pool?.double || 0)},
    ]
  }

  get summary(): string {
    const racecard = this.racecards.find(r => r.race === 1);
    if (!racecard) return '---';

    const date = racecard.meeting;
    const venue = racecard.venue;
    const course = this.racecards.find(r => r.course)?.course || 'AWT';
    const total = this.racecards.length;
    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', {weekday: 'short'})
      .toUpperCase();

    const horses = this.starters.length;
    const jockeys = this.jockeys.length;
    const trainers = this.trainers.length;

    return `
        ${dayOfWeek}, ${date}, ${venue}, ${course} Course x
        ${total} Races, ${jockeys} Jockeys, ${trainers} Trainers, ${horses} Horses
    `;
  }

  get currentMeeting(): string {
    const racecard = this.racecards.find(r => r.race === 1);
    if (!racecard) return '---';
    return racecard.meeting;
  }

  get trainers(): string[] {
    const meetingTrainers = new Set(this.starters.map(s => s.trainer));
    return TRAINERS.map(t => t.code).filter(t => meetingTrainers.has(t));
  }

  get jockeys(): string[] {
    const meetingJockeys = new Set(this.starters.map(s => s.jockey));
    return JOCKEYS.map(j => j.code).filter(j => meetingJockeys.has(j));
  }

  get starters(): Starter[] {
    return this.racecards
      .map(r => r.starters)
      .reduce((prev, curr) => prev.concat(curr), []);
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
    return this.racecards.filter(r => !r.dividend?.win).shift();
  }
}