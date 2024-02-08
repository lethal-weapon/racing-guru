import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Racecard} from '../../model/racecard.model';
import {PLACING_MAPS, SEASONS} from '../../util/strings';
import {ONE_MINUTE} from '../../util/numbers';
import {getMaxRace, getRaceBadgeStyle} from '../../util/functions';
import {
  DividendStarter,
  ConnectionDividend,
  DEFAULT_DIVIDEND_STARTER
} from '../../model/connection.model';

interface DualCount {
  dual: string,
  count: number,
  placings: number[]
}

interface DualPlacingMap {
  player1: string,
  player2: string,
  counts: DualCount[],
  countSum: number
}

@Component({
  selector: 'app-form-connection',
  templateUrl: './form-connection.component.html'
})
export class FormConnectionComponent implements OnInit {
  currentPage: number = 1;
  activePlayers: string[] = [];
  pinnedPlacings: string[] = [];

  activeRace: number = 1;
  racecardPlayer: string = '';

  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchConnectionDividends();
    this.repo.fetchRacecards('latest', () => {
    });

    setInterval(() => {
      this.repo.fetchConnectionDividends();
      this.repo.fetchRacecards('latest', () => {
      });
    }, ONE_MINUTE);
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  toggleRacecardPlayer = (clicked: string) =>
    this.racecardPlayer = this.racecardPlayer === clicked ? '' : clicked;

  togglePlayer = (clicked: string) => {
    if (this.activePlayers.includes(clicked)) {
      this.activePlayers = this.activePlayers.filter(p => p !== clicked);
    } else {
      this.activePlayers.push(clicked);
    }
  }

  togglePinnedPlacing = (clicked: string) => {
    if (this.pinnedPlacings.includes(clicked)) {
      this.pinnedPlacings = this.pinnedPlacings.filter(p => p !== clicked);
    } else {
      this.pinnedPlacings.push(clicked);
    }
  }

  getDividendStarter = (dividend: ConnectionDividend, placing: number): DividendStarter => {
    let matches = dividend.starters.filter(s => s.placing === placing);
    if (matches.length > 0) return matches[0];

    const otherPlacings = [placing - 2, placing - 1, placing + 1, placing + 2];
    for (let i = 0; i < otherPlacings.length; i++) {
      matches = dividend.starters.filter(s => s.placing === otherPlacings[i]);
      if (matches.length === 2) return matches[1];
    }

    return DEFAULT_DIVIDEND_STARTER;
  }

  getDistantPair = (dividend: ConnectionDividend, dpi: number): string => {
    if (dividend.distantPairs.length < dpi) return '';

    return dividend.distantPairs[dpi - 1]
      .map(o => dividend.starters.find(s => s.order === o) || DEFAULT_DIVIDEND_STARTER)
      .sort((s1, s2) => s1.placing - s2.placing)
      .map(s => PLACING_MAPS[s.placing - 1].placing)
      .join(' / ');
  }

  handlePagingControls = (control: string) => {
    switch (control) {
      case 'Reset': {
        this.currentPage = 1;
        this.activePlayers = [];
        this.pinnedPlacings = [];
        break;
      }
      case 'First': {
        this.currentPage = 1;
        break;
      }
      case 'Prev': {
        if (this.currentPage > 1) {
          this.currentPage -= 1;
        }
        break;
      }
      case 'Next': {
        if (this.currentPage < this.maxPage) {
          this.currentPage += 1;
        }
        break;
      }
      case 'Last': {
        this.currentPage = this.maxPage;
        break;
      }
      default:
        break;
    }
  }

  isMatchResult = (playerA: string, playerB: string, placings: number[]): boolean => {
    const results = this.activeRacecard.starters
      .filter(s => [playerA, playerB].includes(s.trainer))
      .filter(s => s?.placing && s.placing > 0)
      .map(s => s.placing);

    return placings.every(p => results.includes(p));
  }

  get isMatchMode(): boolean {
    return this.activePlayers.length > 0;
  }

  get distantPairRatios(): number[] {
    const sourceDividends = this.isMatchMode ? this.displayDividends : this.dividends;
    const dpDividends = sourceDividends.filter(d => d.distantPairs.length > 0);
    const dpPlacingRepr = dpDividends.map(d =>
      d.distantPairs
        .flatMap(ol => ol)
        .map(o => d.starters.find(s => s.order === o) || DEFAULT_DIVIDEND_STARTER)
        .map(s => PLACING_MAPS[s.placing - 1].placing)
        .join()
    );

    return [
      dpDividends.length / sourceDividends.length,
      ...PLACING_MAPS.map(pm =>
        dpPlacingRepr.filter(r => r.includes(pm.placing)).length / dpDividends.length
      )
    ];
  }

  get dualPlacings(): string[] {
    return PLACING_MAPS
      .map((pm1, index1) =>
        PLACING_MAPS
          .filter((_, index2) => index2 > index1)
          .map(pm2 => [pm1.placing, pm2.placing].join(' / '))
      )
      .flatMap(pm => pm);
  }

  get dualPlacingMaps(): DualPlacingMap[] {
    let dualMaps: DualPlacingMap[] = [];
    const sourceDividends = this.dividends
      .filter(d => (d.meeting < this.activeRacecard.meeting) || d.race < this.activeRace);

    for (let i = 0; i < this.activeTrainers.length - 1; i++) {
      const player1 = this.activeTrainers[i];

      for (let j = i + 1; j < this.activeTrainers.length; j++) {
        const player2 = this.activeTrainers[j];
        const dualCounts = PLACING_MAPS
          .map((pm1, index1) => {
            const placing1 = index1 + 1;
            return PLACING_MAPS
              .map((pm2, index2) => {
                if (index2 <= index1) return {dual: '', count: 0, placings: []}

                const placing2 = index2 + 1;
                const count = sourceDividends
                  .filter(d => {
                    const dualPlayers = d.starters
                      .filter(s => s.placing === placing1 || s.placing === placing2)
                      .map(s => [s.jockey, s.trainer])
                      .flatMap(p => p);

                    return [player1, player2].every(p => dualPlayers.includes(p));
                  })
                  .length;

                return {
                  dual: [pm1.placing, pm2.placing].join(' / '),
                  count: count,
                  placings: [placing1, placing2]
                }
              })
          })
          .flatMap(d => d)
          .filter(d => d.dual.length > 0);

        dualMaps.push({
          player1: player1,
          player2: player2,
          counts: dualCounts,
          countSum: dualCounts
            .map(c => c.count)
            .reduce((c1, c2) => c1 + c2, 0)
        });
      }
    }

    return dualMaps.sort((dm1, dm2) =>
      (dm2.countSum - dm1.countSum)
      ||
      (dm2.counts[0].count - dm1.counts[0].count)
      ||
      (dm2.counts[1].count - dm1.counts[1].count)
      ||
      (dm2.counts[2].count - dm1.counts[2].count)
      ||
      (dm2.counts[3].count - dm1.counts[3].count)
      ||
      (dm2.counts[4].count - dm1.counts[4].count)
      ||
      (dm2.counts[5].count - dm1.counts[5].count)
    );
  }

  get pagingControls(): string[] {
    return ['Reset', 'First', 'Last', 'Prev', 'Next'];
  }

  get pagingControlStyle(): string {
    return `mx-auto px-4 pt-1.5 pb-2 text-xl rounded-full cursor-pointer 
            border border-gray-600 hover:border-yellow-400`;
  }

  get maxPage(): number {
    return this.isMatchMode ? 1 : Math.ceil(this.meetings.length / 2);
  }

  get displayMeetings(): string[] {
    return this.displayDividends
      .map(d => d.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get displayDividends(): ConnectionDividend[] {
    if (!this.isMatchMode) {
      const startIndex = 2 * (this.currentPage - 1);
      const pageMeetings = this.meetings.slice(startIndex, startIndex + 2);
      return this.dividends.filter(d => pageMeetings.includes(d.meeting));
    }

    if (this.activePlayers.length > 1) {
      return this.dividends
        .filter(d => {
          const top4Players = d.starters
            .map(s => [s.jockey, s.trainer])
            .flatMap(p => p);

          return this.activePlayers.every(p => top4Players.includes(p));
        });
    }

    const activePlacings = this.pinnedPlacings.length === 0
      ? [1, 2, 3, 4]
      : this.pinnedPlacings.map(p => 1 + PLACING_MAPS.findIndex(pm => pm.placing === p));

    return this.dividends.filter(d => d.starters.some(s =>
      activePlacings.includes(s.placing) &&
      [s.jockey, s.trainer].includes(this.activePlayers[0])
    ));
  }

  get meetings(): string[] {
    return this.dividends
      .map(d => d.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get dividends(): ConnectionDividend[] {
    return this.repo
      .findConnectionDividends()
      .filter(d => d.meeting >= SEASONS[0].opening);
  }

  get activeTrainers(): string[] {
    return this.activeRacecard.starters
      .map(s => s.trainer)
      .filter((m, i, arr) => i === arr.indexOf(m));
  }

  get isLoading(): boolean {
    return this.dividends.length === 0 || this.activeRacecard === undefined;
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get racecards(): Racecard[] {
    return this.repo.findRacecards();
  }
}