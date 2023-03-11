import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../model/websocket.service';
import {Racecard} from '../model/racecard.model';
import {Starter} from '../model/starter.model';
import {WinPlaceOdds} from '../model/order.model';
import {MAX_RACE_PER_MEETING} from '../constants/numbers';
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
  bankers: Map<number, number> = new Map();
  trashes: Map<number, number[]> = new Map();

  currentPage: number = 1;
  hoveredCombination: number[] = [];

  ordinals: Array<{ ordinal: number, superScript: string }> = [
    {ordinal: 1, superScript: 'st'},
    {ordinal: 2, superScript: 'nd'},
    {ordinal: 3, superScript: 'rd'},
    {ordinal: 4, superScript: 'th'},
  ]

  constructor(
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
      this.bankers.set(race, 1);
      this.trashes.set(race, []);
    }
  }

  setActiveRace = (clicked: number) =>
    this.activeRace = clicked

  selectAsBanker = (starter: Starter) => {
    if (this.isUnwantedStarter(starter)) this.toggleTrash(starter);
    this.bankers.set(this.activeRace, starter.order);
  }

  toggleTrash = (starter: Starter) => {
    if (this.isBankerStarter(starter)) return;

    const order = starter.order;
    let unwanted = this.trashes.get(this.activeRace) || [];

    if (unwanted.includes(order)) unwanted = unwanted.filter(e => e !== order);
    else unwanted.push(order);

    this.trashes.set(this.activeRace, unwanted);
  }

  isBankerOrder(order: number): boolean {
    return this.bankers.get(this.activeRace) === order;
  }

  isBankerStarter(starter: Starter): boolean {
    return this.isBankerOrder(starter.order);
  }

  isUnwantedStarter(starter: Starter): boolean {
    return (this.trashes.get(this.activeRace) || []).includes(starter.order);
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

  get currentPageTop4Starters(): Top4Starter[] {
    const fromIndex = this.pageSize * (this.currentPage - 1);
    const toIndex = this.pageSize * this.currentPage;

    return this.top4Starters.filter(
      (s, index) => index >= fromIndex && index < toIndex
    );
  }

  get top4Starters(): Top4Starter[] {
    const banker = this.bankers.get(this.activeRace) || 1;
    const unwanted = this.trashes.get(this.activeRace) || [];
    const orders = this.activeStarters
      .map(s => s.order)
      .filter(o => !unwanted.includes(o))
      .filter(o => o !== banker)
      .sort();

    let combinations = new Set<number[]>;
    for (let i = 0; i < orders.length; i++) {
      const numberA = orders[i];
      for (let j = i + 1; j < orders.length; j++) {
        const numberB = orders[j];
        for (let k = j + 1; k < orders.length; k++) {
          const numberC = orders[k];
          const combination = [banker, numberA, numberB, numberC].sort();
          combinations.add(combination);
        }
      }
    }

    return Array.from(combinations)
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

  get activeStarters(): Starter[] {
    if (!this.activeRacecard) return [];
    return this.activeRacecard.starters.sort((s1, s2) => s1.order - s2.order);
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

  get preferredWeight(): number {
    return 9;
  }
}