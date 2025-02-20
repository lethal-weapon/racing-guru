import {Component, Input, OnInit} from '@angular/core';

import {Racecard} from '../model/racecard.model';
import {BOUNDARY_POOLS} from '../util/strings';
import {formatRace} from '../util/functions';
import {
  DEFAULT_COMBINATIONS,
  DEFAULT_SINGULARS,
  DIVIDEND_CROSS_RACE_POOLS,
  DIVIDEND_RACE_POOLS
} from '../model/dividend.model';

@Component({
  selector: 'app-dividend',
  templateUrl: './dividend.component.html'
})
export class DividendComponent implements OnInit {

  @Input() racecards!: Racecard[];

  protected readonly BOUNDARY_POOLS = BOUNDARY_POOLS;
  protected readonly DIVIDEND_RACE_POOLS = DIVIDEND_RACE_POOLS;
  protected readonly DIVIDEND_CROSS_RACE_POOLS = DIVIDEND_CROSS_RACE_POOLS;
  protected readonly formatRace = formatRace;

  constructor() {
  }

  ngOnInit(): void {
  }

  getDividendTop4 = (race: number): string[] => {
    const starters = this.racecards
        .find(r => r.race === race)
        ?.starters
        .filter(s => (s?.placing || 0) >= 1 && (s?.placing || 0) <= 4)
        .sort((s1, s2) => (s1.placing - s2.placing) || (s1.order - s2.order))
      || [];

    if (starters.length === 0) return [];

    return Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(p => starters
        .filter(s => s.placing === p)
        .map(s => s.order)
        .join('/'));
  }

  getDividendOdds = (race: number, pool: string): number => {
    const d = this.racecards.find(r => r.race === race)?.dividend;
    try {
      switch (pool) {
        case 'WIN':
          return (d?.win || DEFAULT_SINGULARS)[0].odds
        case 'QIN':
          return Math.floor((d?.quinella || DEFAULT_COMBINATIONS)[0].odds)
        case 'FCT':
          return Math.floor((d?.forecast || DEFAULT_COMBINATIONS)[0].odds)
        case 'TRI':
          return Math.floor((d?.trio || DEFAULT_COMBINATIONS)[0].odds)
        case 'F-F':
          return Math.floor((d?.firstFour || DEFAULT_COMBINATIONS)[0].odds)
        case 'TCE':
          return Math.floor((d?.tierce || DEFAULT_COMBINATIONS)[0].odds)
        case 'QTT':
          return Math.floor((d?.quartet || DEFAULT_COMBINATIONS)[0].odds)

        case 'PLA-1':
          return (d?.place || DEFAULT_SINGULARS)[0].odds
        case 'PLA-2':
          return (d?.place || DEFAULT_SINGULARS)[1].odds
        case 'PLA-3':
          return (d?.place || DEFAULT_SINGULARS)[2].odds

        case 'QPL-1':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[0].odds.toFixed(1))
        case 'QPL-2':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[1].odds.toFixed(1))
        case 'QPL-3':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[2].odds.toFixed(1))

        case 'DBL-1':
          return Math.floor((d?.doubles || DEFAULT_COMBINATIONS)[0].odds)
        case 'DBL-2':
          return (d?.doubles || DEFAULT_COMBINATIONS)[1].odds

        case 'TBL-1':
          return Math.floor((d?.treble || DEFAULT_COMBINATIONS)[0].odds)
        case 'TBL-2':
          return Math.floor((d?.treble || DEFAULT_COMBINATIONS)[1].odds)

        case '6UP-1':
          return Math.floor((d?.sixUp || DEFAULT_COMBINATIONS)[0].odds)
        case '6UP-2':
          return Math.floor((d?.sixUp || DEFAULT_COMBINATIONS)[1].odds)

        case 'D-T':
          return Math.floor((d?.doubleTrio || DEFAULT_COMBINATIONS)[0].odds)
        case 'TT-1':
          return Math.floor((d?.tripleTrio || DEFAULT_COMBINATIONS)[0].odds)
        case 'TT-2':
          return Math.floor((d?.tripleTrio || DEFAULT_COMBINATIONS)[1].odds)

        default:
          return 0
      }
    } catch (e) {
      return 0;
    }
  }

  getCrossRacePoolDividendRaces = (row: number): number => {
    if (this.crossRacePoolDividendRaces.length >= row) {
      return this.crossRacePoolDividendRaces[row - 1];
    }
    return 1;
  }

  get crossRacePoolDividendRaces(): number[] {
    let races = this.racecards
      .filter(r =>
        r?.dividend?.treble
        ||
        r?.dividend?.sixUp
        ||
        r?.dividend?.doubleTrio
        ||
        r?.dividend?.tripleTrio
      )
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2);

    while (races.length < 5) races.push(1);
    return races;
  }

  get todayTurnover(): number {
    return this.racecards
      .filter(r => (r?.pool?.meetingTotal || 0) > 0)
      .map(r => r.pool.meetingTotal)
      .sort((t1, t2) => t2 - t1)
      .shift() || 0;
  }

  get maxRace(): number {
    return this.racecards
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2)
      .pop() || 0;
  }
}
