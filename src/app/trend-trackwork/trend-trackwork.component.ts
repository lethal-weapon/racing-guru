import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Player} from '../model/player.model';
import {Racecard} from '../model/racecard.model';
import {TrackworkSnapshot, TrackworkStarter} from '../model/trackwork.model';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {formatMeeting, getOddsIntensityColor, getWinPlaceOdds, toPlacingColor} from '../util/functions';

const BY_FOCUS = 'By Focus';

@Component({
  selector: 'app-trend-trackwork',
  templateUrl: './trend-trackwork.component.html'
})
export class TrendTrackworkComponent implements OnInit {

  activeBadge: string = BY_FOCUS;

  protected readonly BY_FOCUS = BY_FOCUS;
  protected readonly formatMeeting = formatMeeting;
  protected readonly toPlacingColor = toPlacingColor;
  protected readonly getOddsIntensityColor = getOddsIntensityColor;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchTrackworkSnapshots(8);
  }

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  getTrainerFocusStarter =
    (ts: TrackworkSnapshot, trainer: Player): TrackworkStarter | undefined => {

      return ts.starters.find(s => s.trainerFocus && s.trainer === trainer.code)
    }

  getRaceStarters = (race: number): TrackworkStarter[] =>
    this.activeTrackwork.starters
      .filter(s => s.race === race)
      .sort((s1, s2) => (s2.intensity - s1.intensity) || (s1.order - s2.order))

  getStarterWinOdds = (starter: TrackworkStarter | undefined): number => {
    if (starter === undefined) return 0;

    if ((starter?.winOdds || 0) > 0) return starter.winOdds;

    if (this.activeTrackwork.meeting === this.racecards[0].meeting) {
      const card = this.racecards.find(r => r.race === starter.race);
      if (card) {
        return getWinPlaceOdds(starter.jockey, card).win;
      }
    }

    return 0;
  }

  getGradeBorderStyle = (
    race: number,
    starter: TrackworkStarter,
    index: number
  ): string => {

    if (starter.grade !== 'A') return '';

    const sortedStarters = this.getRaceStarters(race);
    if (index === sortedStarters.length - 1) return '';

    return sortedStarters[index + 1]?.grade !== 'A'
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
    const match = this.trackworks.find(ts => ts.meeting === this.activeBadge);
    return match ? match : this.trackworks[0];
  }

  get trackworks(): TrackworkSnapshot[] {
    return this.repo.findTrackworkSnapshots();
  }

  get trainers(): Player[] {
    return this.repo.findPlayers().filter(p => !p.jockey);
  }

  get racecards(): Racecard[] {
    return this.repo.findRacecards();
  }

  get isLoading(): boolean {
    return this.repo.findPlayers().length === 0
      || this.repo.findTrackworkSnapshots().length < 2
      || this.repo.findRacecards().length === 0;
  }
}
