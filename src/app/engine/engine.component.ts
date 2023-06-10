import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {RestRepository} from '../model/rest.repository';
import {WebsocketService} from '../model/websocket.service';
import {COLORS} from '../util/strings';
import {
  ONE_MILLION,
  THREE_SECONDS,
  PAYOUT_RATE,
  FCT_TRI_PAYOUT_RATE
} from '../util/numbers';
import {
  getMaxRace,
  getPlacingBorderBackground,
  getRaceBadgeStyle,
  getStarters,
  getStarterWinPlaceOdds,
  getStarterQQPWinPlaceOdds,
  getStarterDBLWinOdds
} from '../util/functions';

interface WQPInvestment {
  odds: number,
  amount: string,
  percent: string
}

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;

  protected readonly COLORS = COLORS;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getStarters = getStarters;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;
  protected readonly getPlacingBorderBackground = getPlacingBorderBackground;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService,
    private clipboard: Clipboard
  ) {
    socket.racecards.subscribe(data => this.racecards = data);
  }

  ngOnInit(): void {
    setInterval(() => this.socket.racecards.next([]), THREE_SECONDS);
    this.repo.fetchHorses();
  }

  isPreferredWQWR = (starter: Starter): boolean => {
    const wp = getStarterWinPlaceOdds(starter, this.activeRacecard);
    if (wp.win == 0 || wp.place == 0) return false;

    const W = wp.win;
    const QW = getStarterQQPWinPlaceOdds(starter, this.activeRacecard)[0];
    if (W > 30 || QW > W) return false;

    return W < 10 && (W - QW <= 1.5)
      ? true
      : Math.abs(1 - W / QW) <= 0.2;
  }

  isPreferredPQPR = (starter: Starter): boolean => {
    const wp = getStarterWinPlaceOdds(starter, this.activeRacecard);
    if (wp.win == 0 || wp.place == 0) return false;

    const P = 3 * wp.place;
    const QPP = 3 * getStarterQQPWinPlaceOdds(starter, this.activeRacecard)[1];
    if (P > 25 || QPP > P) return false;

    return P < 9 && (P - QPP <= 1.25)
      ? true
      : Math.abs(1 - P / QPP) <= 0.2;
  }

  isPreferredWDWR = (starter: Starter): boolean => {
    const wp = getStarterWinPlaceOdds(starter, this.activeRacecard);
    if (wp.win == 0 || wp.place == 0) return false;

    const W = wp.win;
    const DW = getStarterDBLWinOdds(starter, this.activeRacecard);
    if (W > 30 || DW > 21 || DW > W) return false;

    return W < 10 && (W - DW <= 3)
      ? true
      : Math.abs(1 - W / DW) <= 0.25;
  }

  getWQPInvestment = (starter: Starter): WQPInvestment[] => {
    const pool = this.activeRacecard?.pool;
    if (!pool) return [];

    const WP = getStarterWinPlaceOdds(starter, this.activeRacecard);
    const QQP_WP = getStarterQQPWinPlaceOdds(starter, this.activeRacecard);
    const DW = getStarterDBLWinOdds(starter, this.activeRacecard);

    return [
      {odds: WP.win, amount: pool.win},
      {odds: QQP_WP[0], amount: pool.quinella},
      {odds: 3 * WP.place, amount: pool.place},
      {odds: 3 * QQP_WP[1], amount: pool?.quinellaPlace || 0},
      {odds: DW, amount: pool?.double || 0},

    ].map((o, index) => {
      const rate = index < 5 ? PAYOUT_RATE : FCT_TRI_PAYOUT_RATE;
      return {
        odds: index < 2 || index > 3 ? o.odds : parseFloat((o.odds / 3).toFixed(1)),
        amount: `$${(o.amount * rate / o.odds / ONE_MILLION).toFixed(2)}M`,
        percent: `${(100 * rate / o.odds).toFixed(1)}%`
      }
    });
  }

  getHorseNameCH = (horseCode: string): string =>
    this.repo.findHorses().find(h => h.code === horseCode)?.nameCH || horseCode

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get maxRace(): number {
    return this.racecards.map(r => r.race).pop() || 0;
  }
}
