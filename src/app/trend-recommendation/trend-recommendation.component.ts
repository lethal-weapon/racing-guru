import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Racecard} from '../model/racecard.model';
import {EarningStarter, Meeting} from '../model/meeting.model';
import {Recommendation, StarterRank} from '../model/recommendation.model';
import {PLACING_MAPS} from '../util/strings';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {
  formatMeeting,
  formatRace,
  getPlacingBorderBackground,
  getWinPlaceOdds,
  isBoundaryMeeting,
  toPlacingColor
} from '../util/functions';

const BY_STATS = 'By Stats';
const BY_INHERITANCE = 'By IRank';
const BY_TOP5 = 'By Top 5';

@Component({
  selector: 'app-trend-recommendation',
  templateUrl: './trend-recommendation.component.html'
})
export class TrendRecommendationComponent implements OnInit {

  activeBadge: string = BY_TOP5;

  protected readonly BY_STATS = BY_STATS;
  protected readonly BY_INHERITANCE = BY_INHERITANCE;
  protected readonly BY_TOP5 = BY_TOP5;
  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;
  protected readonly formatRace = formatRace;
  protected readonly formatMeeting = formatMeeting;
  protected readonly toPlacingColor = toPlacingColor;
  protected readonly isBoundaryMeeting = isBoundaryMeeting;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    if (this.repo.findRecommendations().length < 2) {
      this.repo.fetchRecommendations(15);
    }
  }

  getRacesOnMeeting = (meeting: string): number[] =>
    (this.recommendations.find(r => r.meeting === meeting)?.races || [])
      .map(r => r.race)
      .sort((r1, r2) => r2 - r1)

  getEarningStarter = (meeting: string, race: number, placing: number): EarningStarter | undefined =>
    (this.meetings.find(m => m.meeting === meeting)?.players || [])
      .flatMap(ps => ps.starters)
      .filter(s => !s.scratched)
      .filter(s => s.race === race && s?.placing === placing)
      .shift()

  getOdds = (meeting: string, race: number, placing: number): number =>
    this.getEarningStarter(meeting, race, placing)?.winOdds || 0

  getRankInheritancePlacingCount = (meeting: string, placing: number): number =>
    this.getRacesOnMeeting(meeting)
      .filter(r => this.isRankInherited(meeting, r, placing))
      .length

  getRankInheritanceAverageEarning = (m: Meeting): number => {
    const totalEarning = m.players
      .map(p => {
        p.meeting = m.meeting;
        return p;
      })
      .flatMap(ps => ps.starters.map(s => {
        s.meeting = ps.meeting;
        return s;
      }))
      .filter(es => (es?.earning || 0) > 0)
      .filter(es => this.isRankInherited(es.meeting, es.race, es.placing))
      .map(es => es.earning / 2)
      .reduce((prev, curr) => prev + curr, 0);

    // ignore first race
    const races = this.getRacesOnMeeting(m.meeting).length - 1;

    return parseFloat((totalEarning / (races < 1 ? 1 : races)).toFixed(1));
  }

  isMultipleRankInheritance = (meeting: string, race: number): boolean =>
    [1, 2, 3, 4].filter(p => this.isRankInherited(meeting, race, p)).length > 1

  isRankInherited = (meeting: string, race: number, placing: number): boolean => {
    const races = this.recommendations.find(r => r.meeting === meeting)?.races || [];
    if (races.length < 1) return false;

    const currentRaceRanks = races.find(r => r.race === race)?.starters || [];
    const previousRaceRanks = races.find(r => r.race === race - 1)?.starters || [];
    if (currentRaceRanks.length < 1 || previousRaceRanks.length < 1) return false;

    const order = this.getEarningStarter(meeting, race, placing)?.order || 0;
    if (order < 0) return false;

    const currentRaceRank = currentRaceRanks.find(crr => crr.order === order)?.rank || 0;

    return previousRaceRanks
      .filter(prr => [1, 2, 3, 4].includes(this.getStarterPlacing(meeting, race - 1, prr.order)))
      .map(prr => prr.rank)
      .includes(currentRaceRank);
  }

  isTopExactRankPlacing = (rank: number, placing: number): boolean =>
    this.exactRankPositions
      .map(rp => this.getExactRankPlacingCount(rp, placing))
      .sort((c1, c2) => c2 - c1)
      .slice(0, 3)
      .includes(this.getExactRankPlacingCount(rank, placing))

  isTopTotalExactRankPlacing = (rank: number): boolean =>
    this.exactRankPositions
      .map(rp => this.getTotalExactRankPlacingCount(rp))
      .sort((c1, c2) => c2 - c1)
      .slice(0, 3)
      .includes(this.getTotalExactRankPlacingCount(rank))

  getTotalExactRankPlacingCount = (rank: number): number =>
    [1, 2, 3, 4]
      .map(placing => this.getExactRankPlacingCount(rank, placing))
      .reduce((prev, curr) => prev + curr, 0)

  getExactRankPlacingCount = (rank: number, placing: number): number => {
    let count = 0;

    this.recommendations.forEach(rec => {
      rec.races.forEach(r => {

        if (r.starters.some(s =>
          s.placings.some(sp => sp.rank === rank && sp.placing === placing)
          &&
          placing === this.getStarterPlacing(rec.meeting, r.race, s.order)
        )) {
          count += 1;
        }
      });
    });

    return count;
  }

  isTopRankPlacing = (rank: number, placing: number): boolean =>
    this.rankPositions
      .map(rp => this.getRankPlacingCount(rp, placing))
      .sort((c1, c2) => c2 - c1)
      .slice(0, 3)
      .includes(this.getRankPlacingCount(rank, placing))

  isTopTotalRankPlacing = (rank: number): boolean =>
    this.rankPositions
      .map(rp => this.getTotalRankPlacingCount(rp))
      .sort((c1, c2) => c2 - c1)
      .slice(0, 3)
      .includes(this.getTotalRankPlacingCount(rank))

  getTotalRankPlacingCount = (rank: number): number =>
    [1, 2, 3, 4]
      .map(placing => this.getRankPlacingCount(rank, placing))
      .reduce((prev, curr) => prev + curr, 0)

  getRankPlacingCount = (rank: number, placing: number): number => {
    let count = 0;

    this.recommendations.forEach(rec => {
      rec.races.forEach(r => {

        let correctedRank = rank;
        if (rank < 0) {
          const index = Math.abs(rank) - 1;
          const reversedSortedRanks = r.starters
            .map(s => s.rank)
            .sort((r1, r2) => r2 - r1);

          correctedRank = reversedSortedRanks[index];
        }

        if (r.starters.some(s =>
          s.rank === correctedRank
          &&
          placing === this.getStarterPlacing(rec.meeting, r.race, s.order)
        )) {
          count += 1;
        }
      });
    });

    return count;
  }

  getStarterPlacing = (meeting: string, race: number, order: number): number =>
    (
      this.meetings
        .find(m => m.meeting === meeting)
        ?.players || []
    )
      .flatMap(m => m.starters)
      .filter(s => s.race === race && s.order === order)
      .pop()
      ?.placing || 0;

  getStarterPlacingColor = (race: number, order: number): string => {
    const placing =
      this.getStarterPlacing(this.activeRecommendation.meeting, race, order);

    return toPlacingColor(placing);
  }

  getStarterOdds = (race: number, order: number): number => {
    if (this.activeRecommendation.meeting === this.latestRacecards[0].meeting) {
      const card = this.latestRacecards.find(r => r.race === race);
      const jockey = (card?.starters || []).find(s => s.order === order)?.jockey;

      if (jockey) {
        // @ts-ignore
        return getWinPlaceOdds(jockey, card).win;
      }
    }

    return this.getOdds(
      this.activeRecommendation.meeting,
      race,
      this.getStarterPlacing(this.activeRecommendation.meeting, race, order)
    );
  }

  getTop4EarningStarterWithinTop5Recommendation =
    (meeting: Meeting, race: number): EarningStarter[] => {

      const rankedOrders =
        (
          (this.recommendations.find(r => r.meeting === meeting.meeting)?.races || [])
            .find(r => r.race === race)
            ?.starters || []
        )
          .filter(s => s.rank >= 1 && s.rank <= 5)
          .map(s => s.order);

      if (rankedOrders.length < 1) return [];

      // @ts-ignore
      return [1, 2, 3, 4]
        .map(placing => this.getEarningStarter(meeting.meeting, race, placing))
        .filter(es => es)
        .filter(es => rankedOrders.includes(es?.order || 0));
    }

  getStarterBorderStyle = (race: number, starter: StarterRank): string => {
    // @ts-ignore
    return getPlacingBorderBackground({
      placing: this.getStarterPlacing(this.activeRecommendation.meeting, race, starter.order)
    });
  }

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  get exactRankPositions(): number[] {
    return [1, 2, 3, 4, 5, 6];
  }

  get rankPositions(): number[] {
    return [1, 2, 3, 4, 5, 6, -4, -3, -2, -1];
  }

  get activeRecommendation(): Recommendation {
    if (this.activeBadge.includes('-')) {
      // @ts-ignore
      return this.recommendations.find(r => r.meeting === this.activeBadge);
    }
    return this.recommendations[0];
  }

  get latestRacecards(): Racecard[] {
    return this.repo.findRacecards();
  }

  get recommendations(): Recommendation[] {
    return this.repo.findRecommendations();
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings().slice(0, 15);
  }

  get isLoading(): boolean {
    return this.repo.findMeetings().length < 2
      || this.repo.findRecommendations().length < 2;
  }
}
