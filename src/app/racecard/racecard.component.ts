import {Component, OnInit} from '@angular/core';

import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {RacecardRepository} from '../model/racecard.repository';
import {WinPlaceOdds} from '../model/order.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  activeDraw: number = 0
  activeTrainer: string = ''

  constructor(private repo: RacecardRepository) {
  }

  ngOnInit(): void {
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
      && (!race.name.includes('CUP'))
      && (
        race.grade.endsWith('3')
        || race.grade.endsWith('4')
        || race.grade.endsWith('5')
      )
    )
  }

  isBoundaryJockey(jockey: string): boolean {
    let specials = []
    for (const j of ['BA', 'LDE', 'BV']) {
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

  get remainingSeconds(): string {
    if (!this.next) return `0`;

    const raceTime = new Date(this.next.time).getTime();
    const currTime = new Date().getTime();
    const diff = Math.floor((raceTime - currTime) / 1000);

    if (diff > 999) return `999+`
    return `${diff}`
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
    return this.racecards.filter(r => !r.dividend).shift();
  }

  get racecards(): Racecard[] {
    return this.repo.findAll();
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
    if (!racecard) return 'Unknown';

    const date = racecard.meeting;
    const venue = racecard.venue;
    const total = this.racecards.length;
    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', {weekday: 'short'})
      .toUpperCase();

    const horses = this.starters.length;
    const jockeys = this.jockeys.length;
    const trainers = this.trainers.length;

    return `
        ${dayOfWeek}, ${date}, ${venue}, ${total} Races, 
        ${jockeys} Jockeys, ${trainers} Trainers, ${horses} Horses
    `;
  }

}