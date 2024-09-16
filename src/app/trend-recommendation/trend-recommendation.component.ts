import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Meeting} from '../model/meeting.model';
import {Recommendation, StarterRank} from '../model/recommendation.model';
import {formatMeeting, getPlacingBorderBackground} from '../util/functions';

@Component({
  selector: 'app-trend-recommendation',
  templateUrl: './trend-recommendation.component.html'
})
export class TrendRecommendationComponent implements OnInit {

  activeMeeting: string = '';

  protected readonly formatMeeting = formatMeeting;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchRecommendations(8, () => {
      this.activeMeeting = this.repo.findRecommendations()[0].meeting;
    });
  }

  getStarterBorderStyle = (race: number, starter: StarterRank): string => {
    const placing = (
      this.meetings
        .find(m => m.meeting === this.activeRecommendation.meeting)
        ?.players || []
    )
      .flatMap(m => m.starters)
      .filter(s => s.race === race && s.order === starter.order)
      .pop()
      ?.placing || 0;

    // @ts-ignore
    return getPlacingBorderBackground({placing: placing});
  }

  getBadgeStyle = (render: string): string =>
    this.activeMeeting === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  get activeRecommendation(): Recommendation {
    if (this.activeMeeting.length > 0) {
      // @ts-ignore
      return this.recommendations.find(r => r.meeting === this.activeMeeting);
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
