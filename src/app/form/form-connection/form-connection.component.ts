import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Starter} from '../../model/starter.model';
import {Racecard} from '../../model/racecard.model';
import {ConnectionDividend} from '../../model/connection.model';
import {Horse, DEFAULT_HORSE} from '../../model/horse.model';
import {PLACING_MAPS, SEASONS} from '../../util/strings';
import {MAX_RACE_PER_MEETING, ONE_MINUTE, TEN_SECONDS} from '../../util/numbers';
import {
  getMaxRace,
  getPlacing,
  getStarters,
  getRaceBadgeStyle,
  getStarterWinPlaceOdds,
  getPlacingBorderBackground
} from '../../util/functions';

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
  activeRace: number = 1;
  activeOrderByRace: Map<number, number> = new Map();
  trashes: Map<number, number[]> = new Map();

  protected readonly getMaxRace = getMaxRace;
  protected readonly getStarters = getStarters;
  protected readonly getRaceBadgeStyle = getRaceBadgeStyle;
  protected readonly getStarterWinPlaceOdds = getStarterWinPlaceOdds;
  protected readonly getPlacingBorderBackground = getPlacingBorderBackground;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchMeetingHorses();
    this.repo.fetchRacecards();
    this.repo.fetchConnections();
    this.repo.fetchConnectionDividends();

    setInterval(() => this.repo.fetchRacecards(), TEN_SECONDS);
    setInterval(() => this.repo.fetchConnectionDividends(), ONE_MINUTE);

    for (let race = 1; race <= MAX_RACE_PER_MEETING; race++) {
      this.activeOrderByRace.set(race, 0);
      this.trashes.set(race, []);
    }
  }

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

  getHorse = (starter: Starter): Horse =>
    this.repo.findHorses()
      .find(s => s.code === starter.horse) || DEFAULT_HORSE

  getRanking = (starter: Starter): number =>
    1 + this.rankedOrders.indexOf(starter.order);

  getReverseRanking = (starter: Starter): number =>
    this.rankedOrders.length - this.rankedOrders.indexOf(starter.order);

  isTrashStarter = (starter: Starter): boolean =>
    (this.trashes.get(this.activeRace) || []).includes(starter.order)

  isMatchResult = (starterA: Starter, starterB: Starter, placings: number[]): boolean => {
    const results = this.activeRacecard.starters
      .filter(s => s.order == starterA.order || s.order == starterB.order)
      .map(s => getPlacing(s.jockey, this.activeRacecard));

    if (placings.length == 0) {
      return results.length > 0 && results.every(p => p >= 1 && p <= 4);
    }

    return placings.every(p => results.includes(p));
  }

  isConnectedPair = (starterA: Starter, starterB: Starter): boolean => {
    return this.repo.findConnections()
      .find(c => c.meeting === this.activeRacecard.meeting && c.race == this.activeRace)
      ?.connections
      .some(c =>
        (c.orders[0] == starterA.order && c.orders[1] == starterB.order)
        ||
        (c.orders[0] == starterB.order && c.orders[1] == starterA.order)
      ) || false;
  }

  isDrawInheritancePair = (starterA: Starter, starterB: Starter): boolean =>
    [starterA.draw, starterB.draw].every(d => this.lastTop4Draws.includes(d));

  get rankedOrders(): number[] {
    return this.activeRacecard.starters
      .filter(s => !s.scratched)
      .sort((s1, s2) => (s2?.chance || 0) - (s1?.chance || 0))
      .map(s => s.order);
  }

  get lastTop4Draws(): number[] {
    if (this.activeRace === 1) {
      const priorMeetings = this.meetings.filter(m => m < this.activeRacecard.meeting);
      if (priorMeetings.length < 1) return [];

      return this.dividends
        .find(d => d.meeting === priorMeetings[0] && d.race === 1)
        ?.starters
        .filter(s => s.placing >= 1 && s.placing <= 4)
        .map(s => s.draw) || [];
    }

    const lastRacecard = this.racecards.find(r => r.race === this.activeRace - 1);
    if (!lastRacecard) return [];

    return lastRacecard.starters
      .filter(s =>
        getPlacing(s.jockey, lastRacecard) >= 1 &&
        getPlacing(s.jockey, lastRacecard) <= 4
      )
      .map(s => s.draw);
  }

  get dualPlacingMaps(): DualPlacingMap[] {
    let dualMaps: DualPlacingMap[] = [];

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
                const count = this.dividends
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
                    return starter2.jockey == dualStarters[1].jockey && starter1.trainer == dualStarters[0].trainer;
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
      || (dm2.counts[0].count - dm1.counts[0].count)
      || (dm2.counts[1].count - dm1.counts[1].count)
      || (dm2.counts[2].count - dm1.counts[2].count)
      || (dm2.counts[3].count - dm1.counts[3].count)
      || (dm2.counts[4].count - dm1.counts[4].count)
      || (dm2.counts[5].count - dm1.counts[5].count)
    );
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

  get meetings(): string[] {
    return this.dividends
      .map(d => d.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get dividends(): ConnectionDividend[] {
    return this.repo
      .findConnectionDividends()
      .filter(d => d.meeting >= SEASONS[0].opening)
      .filter(d => (d.meeting < this.activeRacecard.meeting) || d.race < this.activeRace);
  }

  get activeStarters(): Starter[] {
    return this.activeRacecard.starters
      .filter(s => !s.scratched && s.jockey && s.trainer)
      .filter(s => !this.isTrashStarter(s));
  }

  get activeOrder(): number {
    return this.activeOrderByRace.get(this.activeRace) || 0;
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get racecards(): Racecard[] {
    return this.repo.findRacecards();
  }

  get isLoading(): boolean {
    return this.repo.findHorses().length === 0
      || this.repo.findRacecards().length === 0
      || this.repo.findConnections().length === 0
      || this.repo.findConnectionDividends().length === 0;
  }
}
