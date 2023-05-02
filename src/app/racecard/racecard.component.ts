import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../model/websocket.service';
import {PastStarter, Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {WinPlaceOdds} from '../model/order.model';
import {ONE_MILLION, PAYOUT_RATE} from '../util/numbers';
import {RestRepository} from '../model/rest.repository';
import {CollaborationStarter} from '../model/collaboration.model';

@Component({
  selector: 'app-racecard',
  templateUrl: './racecard.component.html'
})
export class RacecardComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;
  hoveredJockey: string = '';

  constructor(
    private socket: WebsocketService,
    private repo: RestRepository
  ) {
    // socket.racecards.subscribe(data => this.racecards = data);
  }

  ngOnInit(): void {
    // setInterval(() => this.socket.racecards.next([]), 3_000);
    // this.repo.fetchPastStarters();
    // this.repo.fetchCollaborations();
  }

  // setHoveredJockey = (hovered: string) =>
  //   this.hoveredJockey = hovered;
  //
  // setActiveRace = (clicked: number) =>
  //   this.activeRace = clicked
  //
  // getPastHorseStarters(current: Starter): PastStarter[] {
  //   return this.repo.findPastStarters()
  //     .filter(s => s.horse === current.horse)
  //     .slice(0, 16);
  // }
  //
  // getPastCollaborationStarters(current: Starter): CollaborationStarter[] {
  //   return (
  //     this.repo.findCollaborations()
  //       .filter(c => c.jockey === current.jockey && c.trainer === current.trainer)
  //       .pop()
  //       ?.starters || []
  //   )
  //     .filter(s => {
  //       if (s.meeting !== this.currentMeeting) return true;
  //       return s.meeting === this.currentMeeting && s.race < this.activeRace;
  //     })
  //     .sort((r1, r2) =>
  //       r2.meeting.localeCompare(r1.meeting) || r2.race - r1.race
  //     )
  //     .slice(0, 28);
  // }
  //
  // getRaceBadgeStyle(race: number): string {
  //   return this.activeRace === race
  //     ? `text-yellow-400 border-yellow-400`
  //     : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`;
  // }
  //
  // isActiveFavorite(starter: Starter): boolean {
  //   return this.activeRacecard.favorites.includes(starter.order);
  // }
  //
  // isPreferredWQWR(starter: Starter): boolean {
  //   const wp = this.getActiveStarterWinPlaceOdds(starter);
  //   if (wp.win == 0 || wp.place == 0) return false;
  //
  //   const W = wp.win;
  //   const QW = this.getActiveStarterQWOdds(starter)
  //   if (QW > W) return false;
  //
  //   if (W < 10 && (W - QW <= 1.5)) {
  //     return true;
  //   }
  //   return Math.abs(1 - W / QW) <= 0.2;
  // }
  //
  // getActiveStarterQWOdds(starter: Starter): number {
  //   const qqpWP = this.getQQPWinPlaceOdds(starter.order, this.activeRacecard);
  //   return parseFloat(qqpWP[0].toFixed(2));
  // }
  //
  // isFinalFCTCombination(starterA: Starter, starterB: Starter): boolean {
  //   const placings = [starterA, starterB]
  //     .map(s => this.getPlacing(s.jockey, this.activeRacecard));
  //   return placings[0] === 1 && placings[1] === 2;
  // }
  //
  // isFCTOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
  //   return this.getActiveStarterFCTOdds(starterA, starterB)
  //     .map(o => o > 0 && o < 300);
  // }
  //
  // getActiveStarterFCTOdds(starterA: Starter, starterB: Starter): number[] {
  //   const fct = this.activeRacecard?.odds?.forecast;
  //   if (!fct) return [0, 0];
  //
  //   const pairs = fct.filter(comb =>
  //     comb.orders.includes(starterA.order) &&
  //     comb.orders.includes(starterB.order)
  //   )
  //
  //   if (pairs.length !== 2) return [0, 0];
  //   if (pairs[0].orders[0] === starterA.order) return pairs.map(p => p.odds);
  //   return pairs.reverse().map(p => p.odds);
  // }
  //
  // isFinalQQPCombination(starterA: Starter, starterB: Starter): boolean[] {
  //   const placingSum = [starterA, starterB]
  //     .map(s => this.getPlacing(s.jockey, this.activeRacecard))
  //     .map(p => [0, 4].includes(p) ? 9 : p)
  //     .reduce((prev, curr) => prev + curr, 0);
  //   return [
  //     placingSum === 3,
  //     [3, 4, 5].includes(placingSum),
  //   ]
  // }
  //
  // isQQPOddsWithinRange(starterA: Starter, starterB: Starter): boolean[] {
  //   const qqp = this.getActiveStarterQQPOdds(starterA, starterB);
  //   return [
  //     qqp[0] > 0 && qqp[0] < 150,
  //     qqp[1] > 0 && qqp[1] < 75,
  //   ]
  // }
  //
  // getActiveStarterQQPOdds(starterA: Starter, starterB: Starter): number[] {
  //   if (!this.activeRacecard?.odds) return [0, 0];
  //   const qin = this.activeRacecard.odds?.quinella;
  //   const qpl = this.activeRacecard.odds?.quinellaPlace;
  //
  //   return [qin, qpl].map(pairs => {
  //     if (!pairs) return 0;
  //     return pairs
  //       .filter(p => p.orders.includes(starterA.order))
  //       .filter(p => p.orders.includes(starterB.order))
  //       .pop()
  //       ?.odds || 0;
  //   });
  // }
  //
  // getActiveStarterWinPlaceOdds(starter: Starter): WinPlaceOdds {
  //   if (!this.activeRacecard) return {order: starter.order, win: 0, place: 0};
  //   return this.getWinPlaceOdds(starter.jockey, this.activeRacecard);
  // }
  //
  // getActiveStarterWQPInvestments(starter: Starter): Array<{ percent: string, amount: string }> {
  //   const pool = this.activeRacecard?.pool;
  //   if (!pool) return [];
  //
  //   const WP = this.getActiveStarterWinPlaceOdds(starter);
  //   const QW = this.getActiveStarterQWOdds(starter);
  //
  //   return [
  //     {odds: WP.win, amount: pool.win},
  //     {odds: QW, amount: pool.quinella},
  //     {odds: 3 * WP.place, amount: pool.place}
  //   ].map(o => ({
  //     percent: `${(100 * PAYOUT_RATE / o.odds).toFixed(1)}%`,
  //     amount: `$${(o.amount * PAYOUT_RATE / o.odds / ONE_MILLION).toFixed(2)}M`
  //   }));
  // }
  //
  // getQQPWinPlaceOdds(order: number, racecard: Racecard): number[] {
  //   const qin = racecard.odds?.quinella;
  //   const qpl = racecard.odds?.quinellaPlace;
  //
  //   return [qin, qpl].map(pairs => {
  //     if (!pairs) return 1;
  //     return 2 * PAYOUT_RATE / pairs
  //       .filter(p => p.orders.includes(order))
  //       .map(p => p.odds)
  //       .map(o => PAYOUT_RATE / o)
  //       .reduce((prev, curr) => prev + curr, 0);
  //   });
  // }
  //
  // getQQPCellColor(starterA: Starter, starterB: Starter): string {
  //   if (starterA.order === starterB.order) return ``;
  //   const isBothFavorite =
  //     this.isActiveFavorite(starterA) &&
  //     this.isActiveFavorite(starterB)
  //
  //   return isBothFavorite ? `bg-gray-600` : ``;
  // }
  //
  // formatMeeting(meeting: string): string {
  //   return meeting.replace(/^\d{4}-/g, '')
  // }
  //
  // getPlacingBorderBackground(jockey: string, racecard: Racecard): string {
  //   return [
  //     'border border-gray-700',
  //     'bg-red-800', 'bg-green-800',
  //     'bg-blue-800', 'bg-purple-800',
  //   ][this.getPlacing(jockey, racecard)];
  // }
  //
  // get activeRacecard(): Racecard {
  //   // @ts-ignore
  //   return this.racecards.filter(r => r.race === this.activeRace).pop();
  // }
  //
  // get activeStarters(): Starter[] {
  //   if (!this.activeRacecard) return [];
  //
  //   return this.activeRacecard.starters.sort((s1, s2) => {
  //     const odds1 = this.getWinPlaceOdds(s1.jockey, this.activeRacecard);
  //     const odds2 = this.getWinPlaceOdds(s2.jockey, this.activeRacecard);
  //
  //     return odds1.win - odds2.win
  //       || odds1.place - odds2.place
  //       || this.jockeys.indexOf(s1.jockey) - this.jockeys.indexOf(s2.jockey);
  //   });
  // }
}