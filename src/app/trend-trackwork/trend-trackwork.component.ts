import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {TrackworkSnapshot, TrackworkStarter} from '../model/trackwork.model';
import {formatMeeting, toPlacingColor} from '../util/functions';
import {MAX_RACE_PER_MEETING} from '../util/numbers';

@Component({
  selector: 'app-trend-trackwork',
  templateUrl: './trend-trackwork.component.html'
})
export class TrendTrackworkComponent implements OnInit {

  activeMeeting: string = '';

  protected readonly formatMeeting = formatMeeting;
  protected readonly toPlacingColor = toPlacingColor;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchTrackworkSnapshots(8, () => {
      this.activeMeeting = this.repo.findTrackworkSnapshots()
        .map(t => t.meeting)
        .sort((m1, m2) => m2.localeCompare(m1))
        .shift() || '';
    });
  }

  getBadgeStyle = (renderMeeting: string): string =>
    this.activeMeeting === renderMeeting
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  getRaceStarter = (race: number): TrackworkStarter[] =>
    this.activeTrackwork.starters
      .filter(s => s.race === race)
      .sort((s1, s2) => (s2.intensity - s1.intensity) || (s1.order - s2.order))

  getGradeBorderStyle = (
    race: number,
    starter: TrackworkStarter,
    index: number
  ): string => {

    if (starter.grade !== 'A') return '';

    const sortedStarters = this.getRaceStarter(race);
    if (index === sortedStarters.length - 1) return '';

    return sortedStarters[index + 1]?.grade === 'B'
      ? `border-2 border-gray-900 border-b-yellow-400`
      : ``;
  }

  get maxRace(): number {
    return this.activeTrackwork.starters
      .map(s => s.race)
      .sort((r1, r2) => r1 - r2)
      .pop() || MAX_RACE_PER_MEETING;
  }

  get activeTrackwork(): TrackworkSnapshot {
    const match = this.trackworks.find(ts => ts.meeting === this.activeMeeting);
    return match ? match : this.trackworks[0];
  }

  get trackworks(): TrackworkSnapshot[] {
    return this.repo.findTrackworkSnapshots();
  }

  get isLoading(): boolean {
    return this.repo.findTrackworkSnapshots().length === 0;
  }
}
