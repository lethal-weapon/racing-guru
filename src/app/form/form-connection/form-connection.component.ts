import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Racecard} from '../../model/racecard.model';
import {Starter} from '../../model/starter.model';
import {PLACING_MAPS, SEASONS} from '../../util/strings';
import {MAX_RACE_PER_MEETING, ONE_MINUTE} from '../../util/numbers';
import {
  getMaxRace,
  getPlacingBorderBackground,
  getRaceBadgeStyle,
  getStarters,
  getStarterWinPlaceOdds
} from '../../util/functions';
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
  starter1: Starter,
  starter2: Starter,
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
  activeOrderByRace: Map<number, number> = new Map();
  trashes: Map<number, number[]> = new Map();

  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly getStarters = getStarters;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;
  protected readonly getPlacingBorderBackground = getPlacingBorderBackground;

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

    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.activeOrderByRace.set(race, 0);
      this.trashes.set(race, []);
    }
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  toggleActiveOrder = (clicked: number) =>
    clicked === this.activeOrderByRace.get(this.activeRace)
      ? this.activeOrderByRace.set(this.activeRace, 0)
      : this.activeOrderByRace.set(this.activeRace, clicked)

  toggleTrashStarter = (clicked: number) => {
    const trashes = this.trashes.get(this.activeRace) || [];
    let newTrashes: number[];

    if (trashes.includes(clicked)) {
      newTrashes = trashes.filter(o => o !== clicked);
    } else {
      newTrashes = [...trashes, clicked];
    }

    this.trashes.set(this.activeRace, newTrashes);
  }

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

  isTrashStarter = (starter: Starter): boolean =>
    (this.trashes.get(this.activeRace) || []).includes(starter.order)

  isMatchResult = (starterA: Starter, starterB: Starter, placings: number[]): boolean => {
    const results = this.activeRacecard.starters
      .filter(s => s.order == starterA.order || s.order == starterB.order)
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

    for (let i = 0; i < this.activeStarters.length - 1; i++) {
      const starter1 = this.activeStarters[i];

      for (let j = i + 1; j < this.activeStarters.length; j++) {
        const starter2 = this.activeStarters[j];

        const dualCounts = PLACING_MAPS
          .map((pm1, index1) => {
            const placing1 = index1 + 1;
            return PLACING_MAPS
              .map((pm2, index2) => {
                if (index2 <= index1) return {dual: '', count: 0, placings: []}

                const placing2 = index2 + 1;
                const count = sourceDividends
                  .filter(d => {
                    const dualStarters = d.starters
                      .filter(s => s.placing === placing1 || s.placing === placing2);

                    if (dualStarters.length < 2) return false;

                    const jockeys = dualStarters.map(s => s.jockey);
                    const trainers = dualStarters.map(s => s.trainer);
                    if ([starter1.jockey, starter2.jockey].every(j => jockeys.includes(j))) return true;

                    if (starter1.trainer !== starter2.trainer && trainers[0] !== trainers[1]) {
                      if ([starter1.trainer, starter2.trainer].every(t => trainers.includes(t))) return true;
                    }

                    if (starter1.jockey == dualStarters[0].jockey && starter2.trainer == dualStarters[1].trainer) return true;
                    if (starter1.jockey == dualStarters[1].jockey && starter2.trainer == dualStarters[0].trainer) return true;

                    if (starter2.jockey == dualStarters[0].jockey && starter1.trainer == dualStarters[1].trainer) return true;
                    if (starter2.jockey == dualStarters[1].jockey && starter1.trainer == dualStarters[0].trainer) return true;

                    return false;
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
          starter1: starter1,
          starter2: starter2,
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

  get isLoading(): boolean {
    return this.dividends.length === 0 || this.activeRacecard === undefined;
  }

  get activeOrder(): number {
    return this.activeOrderByRace.get(this.activeRace) || 0;
  }

  get activeStarters(): Starter[] {
    return this.activeRacecard.starters
      .filter(s => !s.scratched && s.jockey && s.trainer)
      .filter(s => !this.isTrashStarter(s));
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get racecards(): Racecard[] {
    return this.repo.findRacecards();
  }
}