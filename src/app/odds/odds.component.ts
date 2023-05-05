import {Component, OnInit} from '@angular/core';
import {Clipboard} from "@angular/cdk/clipboard";

import {WebsocketService} from '../model/websocket.service';
import {Racecard} from '../model/racecard.model';
import {Starter} from '../model/starter.model';
import {
  DISPLAY_FCT_ODDS,
  DISPLAY_QIN_ODDS,
  DISPLAY_QPL_ODDS,
  THREE_SECONDS
} from '../util/numbers';
import {
  getMaxRace,
  getPlacing,
  getPlacingColor,
  getRaceBadgeStyle,
  getStarterQWOdds,
  getStarterWinPlaceOdds,
  getStarters,
  isFavorite
} from '../util/functions';

@Component({
  selector: 'app-odds',
  templateUrl: './odds.component.html'
})
export class OddsComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;
  hoveredJockey: string = '';

  protected readonly isFavorite = isFavorite;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getPlacingColor = getPlacingColor;
  protected readonly getStarters = getStarters;
  protected readonly getStarterQWOdds = getStarterQWOdds;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;

  constructor(
    private socket: WebsocketService,
    private clipboard: Clipboard
  ) {
    socket.racecards.subscribe(data => {
      this.racecards = data;
      this.racecards.sort((r1, r2) => r1.race - r2.race);
    });
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), THREE_SECONDS);
  }

  isPreferredWQWR(starter: Starter): boolean {
    const wp = getStarterWinPlaceOdds(starter, this.activeRacecard);
    if (wp.win == 0 || wp.place == 0) return false;

    const W = wp.win;
    const QW = getStarterQWOdds(starter, this.activeRacecard)
    if (QW > W) return false;

    return W < 10 && (W - QW <= 1.5)
      ? true
      : Math.abs(1 - W / QW) <= 0.2;
  }

  isFinalQQPCombination(starterA: Starter, starterB: Starter): boolean[] {
    const placingSum = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard))
      .map(p => [0, 4].includes(p) ? 9 : p)
      .reduce((prev, curr) => prev + curr, 0);
    return [
      placingSum === 3,
      [3, 4, 5].includes(placingSum),
    ];
  }

  isFinalFCTCombination(starterA: Starter, starterB: Starter): boolean {
    const placings = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard));
    return placings[0] === 1 && placings[1] === 2;
  }

  isQQPOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
    const qqp = this.getStarterQQPOdds(starterA, starterB);
    return [
      qqp[0] > 0 && qqp[0] < DISPLAY_QIN_ODDS,
      qqp[1] > 0 && qqp[1] < DISPLAY_QPL_ODDS,
    ];
  }

  isFCTOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
    return this.getStarterFCTOdds(starterA, starterB)
      .map(o => o > 0 && o < DISPLAY_FCT_ODDS);
  }

  getStarterQQPOdds(starterA: Starter, starterB: Starter): number[] {
    if (!this.activeRacecard?.odds) return [0, 0];
    const qin = this.activeRacecard.odds?.quinella;
    const qpl = this.activeRacecard.odds?.quinellaPlace;

    return [qin, qpl].map(pairs => {
      if (!pairs) return 0;
      return pairs
        .filter(p => p.orders.includes(starterA.order))
        .filter(p => p.orders.includes(starterB.order))
        .pop()
        ?.odds || 0;
    });
  }

  getStarterFCTOdds(starterA: Starter, starterB: Starter): number[] {
    const fct = this.activeRacecard?.odds?.forecast;
    if (!fct) return [0, 0];

    const pairs = fct.filter(comb =>
      comb.orders.includes(starterA.order) &&
      comb.orders.includes(starterB.order)
    )

    if (pairs.length !== 2) return [0, 0];
    if (pairs[0].orders[0] === starterA.order) return pairs.map(p => p.odds);
    return pairs.reverse().map(p => p.odds);
  }

  getQQPCellColor(starterA: Starter, starterB: Starter): string {
    if (starterA.order === starterB.order) return ``;
    const isBothFavorite =
      isFavorite(starterA, this.activeRacecard) &&
      isFavorite(starterB, this.activeRacecard)

    return isBothFavorite ? `bg-gray-600` : ``;
  }

  get copyButtonStyle(): string {
    return `px-4 pt-1.5 pb-2 rounded-2xl border border-gray-600 ` +
      `hover:border-yellow-400 hvr-grow-shadow cursor-pointer`;
  }

  get maxStarterOrder(): number {
    return this.activeRacecard.starters
      .map(s => s.order)
      .sort((o1, o2) => o1 - o2)
      .pop() || 14;
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }
}