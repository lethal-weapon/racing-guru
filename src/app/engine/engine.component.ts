import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {RestRepository} from '../model/rest.repository';
import {WebsocketService} from '../model/websocket.service';
import {COLORS} from '../util/strings';
import {
  THREE_SECONDS,
  PAYOUT_RATE,
  FCT_TRI_PAYOUT_RATE,
  MAX_RACE_PER_MEETING
} from '../util/numbers';
import {
  isFavorite,
  isPreferredWQWR,
  getMaxRace,
  getPlacingBorderBackground,
  getRaceBadgeStyle,
  getStarters,
  getStarterWinPlaceOdds,
  getStarterQQPWinPlaceOdds,
  getStarterFCTWQOdds,
  getStarterDBLWinOdds,
  getCurrentMeeting,
  getNewFavorites
} from '../util/functions';

interface Investment {
  odds: number,
  percent: string
}

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {
  racecards: Racecard[] = [];

  activeRace: number = 1;
  bankers: Map<number, number[]> = new Map();

  protected readonly COLORS = COLORS;
  protected readonly isFavorite = isFavorite;
  protected readonly isPreferredWQWR = isPreferredWQWR;
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

    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.bankers.set(race, []);
    }
  }

  reset = () => {
    this.repo.saveFavorite({
      meeting: getCurrentMeeting(this.racecards),
      race: this.activeRace,
      favorites: []
    })
    this.bankers.set(this.activeRace, []);
  }

  toggleFavorite = (starter: Starter) => {
    const newFavorites = getNewFavorites(starter, this.activeRacecard)
    const isRemoveBanker = this.isBanker(starter) &&
      !newFavorites.includes(starter.order);

    this.repo.saveFavorite({
      meeting: getCurrentMeeting(this.racecards),
      race: this.activeRace,
      favorites: newFavorites
    });
    if (newFavorites.length === 0 || isRemoveBanker) {
      this.bankers.set(this.activeRace, []);
    }
  }

  toggleBanker = (starter: Starter) => {
    let newBankers = this.isBanker(starter) ? [] : [starter.order]
    this.bankers.set(this.activeRace, newBankers);
  }

  isBanker = (starter: Starter): boolean =>
    (this.bankers.get(this.activeRace) || []).includes(starter.order);

  isPreferredPQPR = (starter: Starter): boolean => {
    const wp = getStarterWinPlaceOdds(starter, this.activeRacecard);
    if (wp.win == 0 || wp.place == 0) return false;

    const P = 3 * wp.place;
    const QPP = 3 * getStarterQQPWinPlaceOdds(starter, this.activeRacecard)[1];
    if (P > 30 || QPP > P) return false;

    return P < 10 && (P - QPP >= 0.5)
      ? true
      : Math.abs(1 - P / QPP) >= 0.1;
  }

  isPreferredWDWR = (starter: Starter): boolean => {
    const wp = getStarterWinPlaceOdds(starter, this.activeRacecard);
    if (wp.win == 0 || wp.place == 0) return false;

    const W = wp.win;
    if (W > 30) return false;

    const DW = getStarterDBLWinOdds(starter, this.activeRacecard, this.activePrevRacecard);
    const CDW = DW[0];
    const PDW = DW[1];
    if (CDW > 21 || PDW > 21 || CDW > W || PDW > W) return false;

    if (this.activeRace === 1) return Math.abs(1 - W / CDW) >= 0.2;
    if (this.activeRace === this.maxRace) return Math.abs(1 - W / PDW) >= 0.2;

    return Math.abs(1 - W / CDW) >= 0.2 || Math.abs(1 - CDW / PDW) >= 0.2;
  }

  getInvestments = (starter: Starter): Investment[] => {
    const pool = this.activeRacecard?.pool;
    if (!pool) return [];

    const WP = getStarterWinPlaceOdds(starter, this.activeRacecard);
    const QQP_WP = getStarterQQPWinPlaceOdds(starter, this.activeRacecard);
    const FCT_WQ = getStarterFCTWQOdds(starter, this.activeRacecard);
    const DW = getStarterDBLWinOdds(starter, this.activeRacecard, this.activePrevRacecard);

    return [
      WP.win,
      QQP_WP[0],
      3 * WP.place,
      3 * QQP_WP[1],
      ...FCT_WQ,
      ...DW
    ]
      .map((odds, index) => {
        const rate = [4, 5].includes(index) ? FCT_TRI_PAYOUT_RATE : PAYOUT_RATE;
        return {
          odds: parseFloat(odds.toFixed(1)),
          percent: `${(100 * rate / odds).toFixed(1)}%`
        }
      });
  }

  getHorseNameCH = (horseCode: string): string =>
    this.repo.findHorses().find(h => h.code === horseCode)?.nameCH || horseCode

  get isBankerExist(): boolean {
    return (this.bankers.get(this.activeRace) || []).length > 0;
  }

  get activePrevRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace - 1);
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get maxRace(): number {
    return this.racecards.map(r => r.race).pop() || 0;
  }
}