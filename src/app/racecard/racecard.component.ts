import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../model/websocket.service';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {WinPlaceOdds} from '../model/order.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {ONE_MILLION} from '../constants/numbers';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  racecards: Racecard[] = [];

  activeDraw: number = 0;
  activeTrainer: string = '';

  remainingTime: string = '---';

  constructor(private socket: WebsocketService) {
    socket.racecards.subscribe(data => {
      if (this.racecards.length !== data.length) this.racecards = data;
      else {
        this.racecards.forEach(r => {
          const new_card = data.filter(d => d.race === r.race).pop();
          if (new_card && new_card !== r) {
            if (new_card.time !== r.time) r.time = new_card.time;
            if (new_card.starters !== r.starters) r.starters = new_card.starters;
            if (new_card.pool !== r.pool) r.pool = new_card.pool;
            if (new_card.odds !== r.odds) r.odds = new_card.odds;
            if (new_card.dividend !== r.dividend) r.dividend = new_card.dividend;
          }
        })
      }

      this.racecards.sort((r1, r2) => r1.race - r2.race);
    });
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), 3_000);
    setInterval(() => this.updateRemainingTime(), 5_000);
  }

  updateRemainingTime = () => {
    if (!this.next) {
      this.remainingTime = `---`;
      return
    }

    const raceTime = new Date(this.next.time).getTime();
    const currTime = new Date().getTime();
    const diff = Math.floor((raceTime - currTime) / 1000);
    if (diff <= 999) this.remainingTime = `${diff} sec`
    else if (diff <= 3600) this.remainingTime = `${Math.floor(diff / 60)} min`
    else this.remainingTime = `${Math.floor(diff / 3600)} hrs`
  }

  setActiveDraw = (clicked: number) =>
    this.activeDraw = this.activeDraw === clicked ? 0 : clicked

  setActiveTrainer = (clicked: string) =>
    this.activeTrainer = this.activeTrainer === clicked ? '' : clicked

  isHighlightEarning(jockey: string): boolean {
    return this.getMeetingEarning(jockey) >= 12;
  }

  getMeetingEarning(jockey: string): number {
    const earning = this.racecards
      .filter(r => this.getPlacing(jockey, r) > 0)
      .map(r => this.getRaceEarning(jockey, r))
      .reduce((prev, curr) => prev + curr, 0)
      .toFixed(1);
    return parseFloat(earning);
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
      return pla?.odds || 0;

    } else if (placing === 4) {
      return odds.win / 10;
    }

    return 0;
  }

  getPlacing(jockey: string, racecard: Racecard): number {
    if (!racecard.dividend) return 0;
    if (!racecard.dividend.quartet) return 0;

    const orders = racecard.dividend.quartet[0].orders;
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

  isComingFavoured(jockey: string, racecard: Racecard): boolean {
    if (racecard.race < this.nextRace) return false;
    return this.isFavoured(jockey, racecard);
  }

  isFavoured(jockey: string, racecard: Racecard): boolean {
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

  getWinPlaceOdds(jockey: string, racecard: Racecard): WinPlaceOdds {
    const order = this.getStarter(jockey, racecard).order;

    // @ts-ignore
    if (!racecard.odds) return {order: order, win: 0, place: 0}

    // @ts-ignore
    return racecard.odds.winPlace.filter(o => o.order === order).pop();
  }

  getQQPWinPlaceOdds(order: number, racecard: Racecard): number[] {
    const PAYOUT_RATE = 0.825;
    const qin = racecard.odds?.quinella;
    const qpl = racecard.odds?.quinellaPlace;

    return [qin, qpl].map(pairs => {
      if (!pairs) return 1;
      return 2 * PAYOUT_RATE / pairs
        .filter(p => p.orders.includes(order))
        .map(p => p.odds)
        .map(o => PAYOUT_RATE / o)
        .reduce((prev, curr) => prev + curr, 0);
    });
  }

  getTrainer(jockey: string, racecard: Racecard): string {
    return this.getStarter(jockey, racecard).trainer;
  }

  getStarter(jockey: string, racecard: Racecard): Starter {
    // @ts-ignore
    return racecard.starters.filter(s => s.jockey === jockey).pop();
  }

  getHorseProfileUrl(horse: string): string {
    return `
        https://racing.hkjc.com/racing/information/
        English/Horse/Horse.aspx?HorseNo=${horse}
    `.replace(/\s/g, '');
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
    for (const j of ['MNJ', 'BAM', 'PMF', 'CLR']) {
      if (this.jockeys.includes(j)) {
        specials.push(j);
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

  getNextRaceConditionGrade(condition: string, jockey: string): string {
    const grade = this.grades[this.grades.length - 1].grade;
    if (!this.next) return grade;
    if (!this.next.odds) return grade;
    if (!this.rideThisRace(jockey, this.next)) return grade;

    const wp = this.getWinPlaceOdds(jockey, this.next);
    if (wp.win == 0 || wp.place == 0) return grade;

    let ratio = 0;
    if (condition == 'WPCI') ratio = 3 * wp.place / wp.win;
    else {
      const qqpWP = this.getQQPWinPlaceOdds(wp.order, this.next);
      if (condition == 'W/QW') ratio = wp.win / qqpWP[0];
      else if (condition == 'P/QP') ratio = wp.place / qqpWP[1];
    }

    for (const g of this.grades.filter(g => g.range > 0)) {
      if (Math.abs(1 - ratio) <= g.range) return g.grade;
    }
    return grade;
  }

  formatRaceGrade(grade: string): string {
    const clean = grade
      .replace('(', '')
      .replace(')', '')
      .replace('RESTRICTED', '')
      .trim();
    return `${clean[0]}${clean.slice(-1)}`
  }

  getStarterTooltip(jockey: string, racecard: Racecard): string {
    const starter = racecard.starters.filter(s => s.jockey === jockey).pop()
    // @ts-ignore
    const horseNameEN = starter.horseNameEN
    // @ts-ignore
    const horseNameCH = starter.horseNameCH

    return `
      <div class="w-44 text-center">
        <div>${horseNameCH}</div>
        <div>${horseNameEN}</div>
      </div>
    `;
  }

  getRaceTooltip(racecard: Racecard): string {
    const name = racecard.name
      .replace('(', '')
      .replace(')', '')
      .replace('HANDICAP', '')
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
      {pool: 'W', amount: (pool.win / ONE_MILLION).toFixed(2)},
      {pool: 'Q', amount: (pool.quinella / ONE_MILLION).toFixed(2)},
      {pool: 'FT', amount: (pool.forecast / ONE_MILLION).toFixed(2)},
      {pool: 'TCE', amount: (pool.tierce / ONE_MILLION).toFixed(2)},
      {pool: 'P', amount: (pool.place / ONE_MILLION).toFixed(2)},
      {pool: 'QP', amount: (pool.quinellaPlace / ONE_MILLION).toFixed(2)},
      {pool: 'FQ', amount: (pool.quartet / ONE_MILLION).toFixed(2)},
      {pool: 'DBL', amount: ((pool?.double || 0) / ONE_MILLION).toFixed(2)},
    ]
  }

  get grades(): Array<{ grade: string, range: number }> {
    return [
      {grade: 'A', range: 0.15},
      {grade: 'B', range: 0.25},
      {grade: 'C', range: 0},
    ]
  }

  get conditions(): string[] {
    return ['WPCI', 'W/QW', 'P/QP'];
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

  get next(): Racecard {
    // @ts-ignore
    return this.racecards.filter(r => !r.dividend?.win).shift();
  }

  get starters(): Starter[] {
    return this.racecards
      .map(r => r.starters)
      .reduce((prev, curr) => prev.concat(curr), []);
  }

  get trainers(): string[] {
    const meetingTrainers = new Set(this.starters.map(s => s.trainer));
    return TRAINERS.map(t => t.code).filter(t => meetingTrainers.has(t));
  }

  get jockeys(): string[] {
    const meetingJockeys = new Set(this.starters.map(s => s.jockey));
    return JOCKEYS.map(j => j.code).filter(j => meetingJockeys.has(j));
  }

  get meetingSummary(): string {
    const racecard = this.racecards.find(r => r.race === 1);
    if (!racecard) return '---';

    const date = racecard.meeting;
    const venue = racecard.venue;
    const course = this.racecards.find(r => r.course)?.course;
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
}