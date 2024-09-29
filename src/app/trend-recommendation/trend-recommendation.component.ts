import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Meeting} from '../model/meeting.model';
import {Recommendation, StarterRank} from '../model/recommendation.model';
import {formatMeeting, getPlacingBorderBackground} from '../util/functions';
import {PLACING_MAPS} from '../util/strings';

const BY_STATS = 'By Stats';

@Component({
  selector: 'app-trend-recommendation',
  templateUrl: './trend-recommendation.component.html'
})
export class TrendRecommendationComponent implements OnInit {

  activeBadge: string = BY_STATS;

  protected readonly BY_STATS = BY_STATS;
  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly formatMeeting = formatMeeting;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchRecommendations(8, () => {
      this.activeBadge = this.repo.findRecommendations()[0].meeting;
    });
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

  get recommendations(): Recommendation[] {
    return this.repo.findRecommendations();
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }

  get isLoading(): boolean {
    return this.repo.findRecommendations().length === 0
      || this.repo.findMeetings().length === 0;
  }
}
