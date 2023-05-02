import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {WebsocketService} from '../model/websocket.service';
import {Racecard} from '../model/racecard.model';
import {Starter} from '../model/starter.model';
import {WinPlaceOdds} from '../model/order.model';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {RELATIONSHIPS} from '../model/relationship.model';

interface Top4Starter {
  combination: number[],
  weight: number
}

@Component({
  selector: 'app-top4s',
  templateUrl: './top4s.component.html'
})
export class Top4sComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;
  currentPage: number = 1;
  bankers: Map<number, number[]> = new Map();
  trashes: Map<number, number[]> = new Map();

  ordinals: Array<{ ordinal: number, superScript: string }> = [
    {ordinal: 1, superScript: 'st'},
    {ordinal: 2, superScript: 'nd'},
    {ordinal: 3, superScript: 'rd'},
    {ordinal: 4, superScript: 'th'},
  ]

  constructor(
    private clipboard: Clipboard,
    private socket: WebsocketService
  ) {
    socket.racecards.subscribe(data => {
      this.racecards = data;
      this.racecards.sort((r1, r2) => r1.race - r2.race);
    });
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), 3_000);
    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.bankers.set(race, [1]);
      this.trashes.set(race, []);
    }
  }

  setActiveRace = (clicked: number) =>
    this.activeRace = clicked

  toggleBanker = (starter: Starter) => {
    const order = starter.order;
    let bankers = this.bankers.get(this.activeRace) || [1];

    if (bankers.includes(order)) {
      if (bankers.length > 1) {
        bankers = bankers.filter(b => b !== order);
        this.bankers.set(this.activeRace, bankers);
      }
      return;
    }

    if (bankers.length < 4) {
      if (this.isUnwantedStarter(starter)) this.toggleTrash(starter);
      bankers.push(order);
      this.bankers.set(this.activeRace, bankers);
    }
  }

  toggleTrash = (starter: Starter) => {
    if (this.isBankerStarter(starter)) return;

    const order = starter.order;
    let unwanted = this.trashes.get(this.activeRace) || [];

    if (unwanted.includes(order)) unwanted = unwanted.filter(e => e !== order);
    else unwanted.push(order);

    this.trashes.set(this.activeRace, unwanted);
  }

  findFirstFourResult = () => {
    if (!this.activeRacecard?.dividend?.quartet) return;

    const orders = this.activeRacecard.dividend.quartet[0].orders;
    this.currentPage = 1;
    this.bankers.set(this.activeRace, orders);
    this.trashes.set(this.activeRace, []);
  }

  resetStarterState = () => {
    const favorite = this.activeStarters[0].order;
    this.currentPage = 1;
    this.bankers.set(this.activeRace, [favorite]);
    this.trashes.set(this.activeRace, []);
  }

  trashBottom6Starters = () => {
    this.currentPage = 1;
    this.activeStarters
      .filter((s, i) => i >= this.activeStarters.length - 6)
      .filter(s => !this.isUnwantedStarter(s))
      .forEach(s => this.toggleTrash(s));
  }

  copyRecommendedBets = () => {
    const bets = this.recommendedTop4Starters
      .map(s => `ff:${s.combination.join()}`)
      .join(`;`);
    this.clipboard.copy(bets);
  }

  copyShownBets = () => {
    const bankers = this.bankers.get(this.activeRace) || [1];
    const unwanted = this.trashes.get(this.activeRace) || [];
    const selections = this.activeStarters
      .map(s => s.order)
      .filter(o => !unwanted.includes(o))
      .filter(o => !bankers.includes(o))
      .sort((n1, n2) => n1 - n2)
      .join();

    if (bankers.length === 4) this.clipboard.copy(`ff:${bankers.join()}`);
    else this.clipboard.copy(`ff:${bankers.join()}>${selections}|$100`);
  }

  isBankerOrder(order: number): boolean {
    return (this.bankers.get(this.activeRace) || []).includes(order);
  }

  isBankerStarter(starter: Starter): boolean {
    return this.isBankerOrder(starter.order);
  }

  isUnwantedStarter(starter: Starter): boolean {
    return (this.trashes.get(this.activeRace) || []).includes(starter.order);
  }

  isFirstFourPlacing(combination: number[]): boolean {
    if (!this.activeRacecard?.dividend?.quartet) return false;
    return this.activeRacecard.dividend.quartet[0].orders
      .every(o => combination.includes(o));
  }

  isRecommendedTop4Starter(starter: Top4Starter): boolean {
    return starter.weight >= 15
      && starter.weight <= 28
      && this.getFirstFourOdds(starter.combination) >= 50;
  }

  getFirstFourOdds(combination: number[]): number {
    const ffOdds = this.activeRacecard.odds?.firstFour;
    if (!ffOdds) return 0;

    let odds = ffOdds.filter(
      comb => comb.orders.every(s => combination.includes(s))
    ).pop()?.odds || 0;

    if (this.isFirstFourPlacing(combination)) {
      // @ts-ignore
      odds = this.activeRacecard?.dividend?.firstFour[0].odds;
    }

    return odds;
  }

  getPlacing(starter: Starter): number {
    if (!this.activeRacecard?.dividend?.quartet) return 0;

    const orders = this.activeRacecard.dividend.quartet[0].orders;
    const order = starter.order;

    if (!orders.includes(order)) return 0;
    return orders.indexOf(order) + 1;
  }

  getPlacingBorderBackground(starter: Starter): string {
    return [
      'border border-gray-700',
      'bg-red-800', 'bg-green-800',
      'bg-blue-800', 'bg-purple-800',
    ][this.getPlacing(starter)];
  }

  getRaceBadgeStyle(race: number): string {
    return this.activeRace === race
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`;
  }

  getActiveStarterWinPlaceOdds(starter: Starter): WinPlaceOdds {
    const order = starter.order;
    const defaultValue = {order: order, win: 0, place: 0};
    if (!this.activeRacecard?.odds) return defaultValue;

    return this.activeRacecard.odds.winPlace
      .filter(o => o.order === order)
      .pop() || defaultValue;
  }

  getTeamWeight(team: string[]): number {
    let totalWeight = 0;

    for (let i = 0; i < team.length; i++) {
      const memberA = team[i];
      for (let j = i + 1; j < team.length; j++) {
        const memberB = team[j];
        totalWeight += RELATIONSHIPS
          .filter(rel =>
            (rel.personA === memberA && rel.personB === memberB) ||
            (rel.personA === memberB && rel.personB === memberA)
          )
          .map(rel => rel.weight)
          .reduce((prev, curr) => prev + curr, 0);
      }
    }

    return totalWeight;
  }

  get recommendedTop4Starters(): Top4Starter[] {
    return this.top4Starters.filter(s => this.isRecommendedTop4Starter(s));
  }

  get currentPageTop4Starters(): Top4Starter[] {
    const fromIndex = this.pageSize * (this.currentPage - 1);
    const toIndex = this.pageSize * this.currentPage;

    return this.top4Starters.filter(
      (s, index) => index >= fromIndex && index < toIndex
    );
  }

  get top4Starters(): Top4Starter[] {
    return this.allPossibleCombinations
      .map(c => {
        let team = new Set<string>;
        c.map(n => this.activeStarters.find(s => s.order === n))
          .filter(s => s !== undefined)
          .forEach(s => {
            // @ts-ignore
            team.add(s.jockey);
            // @ts-ignore
            team.add(s.trainer);
          });
        return {
          combination: c.sort((n1, n2) => n1 - n2),
          weight: this.getTeamWeight(Array.from(team))
        }
      })
      .sort((s1, s2) => s2.weight - s1.weight);
  }

  get allPossibleCombinations(): number[][] {
    const sorter = (n1: number, n2: number) => n1 - n2;
    const bankers = this.bankers.get(this.activeRace) || [1];
    const unwanted = this.trashes.get(this.activeRace) || [];
    const selections = this.activeStarters
      .map(s => s.order)
      .filter(o => !unwanted.includes(o))
      .filter(o => !bankers.includes(o))
      .sort(sorter);

    let combinations = new Set<number[]>;
    if (bankers.length === 4) combinations.add(bankers.sort(sorter));
    else {
      for (let i = 0; i < selections.length; i++) {
        if (bankers.length === 3) {
          combinations.add(
            [bankers[0], bankers[1], bankers[2], selections[i]].sort(sorter)
          );
          continue
        }

        for (let j = i + 1; j < selections.length; j++) {
          if (bankers.length === 2) {
            combinations.add(
              [bankers[0], bankers[1], selections[i], selections[j]].sort(sorter)
            );
            continue
          }

          for (let k = j + 1; k < selections.length; k++) {
            combinations.add(
              [bankers[0], selections[i], selections[j], selections[k]].sort(sorter)
            );
          }
        }
      }
    }

    return Array.from(combinations);
  }

  get activeStarters(): Starter[] {
    if (!this.activeRacecard) return [];

    return this.activeRacecard.starters.sort((s1, s2) => {
      const odds1 = this.getActiveStarterWinPlaceOdds(s1);
      const odds2 = this.getActiveStarterWinPlaceOdds(s2);

      return odds1.win - odds2.win
        || odds1.place - odds2.place
        || s1.order - s2.order
    });
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.filter(r => r.race === this.activeRace).pop();
  }

  get maxRace(): number {
    return this.racecards.map(r => r.race).pop() || 0;
  }

  get totalPages(): number {
    const combinations = this.top4Starters.length;
    const quotient = Math.floor(combinations / this.pageSize);
    const reminder = combinations % this.pageSize;
    return reminder === 0 ? quotient : quotient + 1;
  }

  get pageSize(): number {
    return 24;
  }
}