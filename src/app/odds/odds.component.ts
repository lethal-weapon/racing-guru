import {Component, OnInit} from '@angular/core';
import {Racecard} from '../model/racecard.model';
import {WebsocketService} from '../model/websocket.service';
import {Starter} from '../model/starter.model';
import {THREE_SECONDS} from '../util/numbers';
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

  constructor(private socket: WebsocketService) {
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

    if (W < 10 && (W - QW <= 1.5)) {
      return true;
    }
    return Math.abs(1 - W / QW) <= 0.2;
  }

  isFinalFCTCombination(starterA: Starter, starterB: Starter): boolean {
    const placings = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard));
    return placings[0] === 1 && placings[1] === 2;
  }

  isFinalQQPCombination(starterA: Starter, starterB: Starter): boolean[] {
    const placingSum = [starterA, starterB]
      .map(s => getPlacing(s.jockey, this.activeRacecard))
      .map(p => [0, 4].includes(p) ? 9 : p)
      .reduce((prev, curr) => prev + curr, 0);
    return [
      placingSum === 3,
      [3, 4, 5].includes(placingSum),
    ]
  }

  isFCTOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
    return this.getActiveStarterFCTOdds(starterA, starterB)
      .map(o => o > 0 && o < 250);
  }

  isQQPOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
    const qqp = this.getActiveStarterQQPOdds(starterA, starterB);
    return [
      qqp[0] > 0 && qqp[0] < 125,
      qqp[1] > 0 && qqp[1] < 60,
    ]
  }

  getActiveStarterFCTOdds(starterA: Starter, starterB: Starter): number[] {
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

  getActiveStarterQQPOdds(starterA: Starter, starterB: Starter): number[] {
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

  getQQPCellColor(starterA: Starter, starterB: Starter): string {
    if (starterA.order === starterB.order) return ``;
    const isBothFavorite =
      isFavorite(starterA, this.activeRacecard) &&
      isFavorite(starterB, this.activeRacecard)

    return isBothFavorite ? `bg-gray-600` : ``;
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }
}