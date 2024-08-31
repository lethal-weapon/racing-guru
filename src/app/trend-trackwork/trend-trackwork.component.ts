import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Player} from '../model/player.model';
import {TrackworkSnapshot, TrackworkStarter} from '../model/trackwork.model';
import {formatMeeting, toPlacingColor} from '../util/functions';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {
  ODDS_INTENSITIES,
  OddsIntensity,
  PLACING_MAPS,
  RATING_GRADES
} from '../util/strings';

const BY_STATS = 'By Stats';

@Component({
  selector: 'app-trend-trackwork',
  templateUrl: './trend-trackwork.component.html'
})
export class TrendTrackworkComponent implements OnInit {

  activeBadge: string = BY_STATS;

  protected readonly BY_STATS = BY_STATS;
  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly RATING_GRADES = RATING_GRADES;
  protected readonly ODDS_INTENSITIES = ODDS_INTENSITIES;
  protected readonly formatMeeting = formatMeeting;
  protected readonly toPlacingColor = toPlacingColor;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchTrackworkSnapshots(8);
  }

  getBadgeStyle = (render: string): string =>
    this.activeBadge === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

  getGradePlacingStartersInOddsRange = (
    grade: string,
    placing: number,
    range: OddsIntensity
  ): TrackworkStarter[] =>
    this.getGradePlacingStarters(grade, placing)
      .filter(s => s.winOdds >= range.lower && s.winOdds <= range.upper)

  getGradePlacingStarters = (grade: string, placing: number): TrackworkStarter[] =>
    this.getGradeStarters(grade).filter(s => s.placing === placing)

  getGradeTop4Starters = (grade: string): TrackworkStarter[] =>
    this.getGradeStarters(grade).filter(s => s.placing >= 1 && s.placing <= 4)

  getGradeStarters = (grade: string): TrackworkStarter[] =>
    this.starters.filter(s => s.grade === grade)

  getRaceStarters = (race: number): TrackworkStarter[] =>
    this.activeTrackwork.starters
      .filter(s => s.race === race)
      .sort((s1, s2) => (s2.intensity - s1.intensity) || (s1.order - s2.order))

  getTrainerGradeTop4Starters = (trainer: Player, grade: string): TrackworkStarter[] =>
    this.getTrainerTop4Starters(trainer).filter(s => s.grade === grade)

  getTrainerTop4Starters = (trainer: Player): TrackworkStarter[] =>
    this.getTrainerStarters(trainer).filter(s => s.placing >= 1 && s.placing <= 4)

  getTrainerStarters = (trainer: Player): TrackworkStarter[] =>
    this.starters.filter(s => s.trainer === trainer.code)

  getTrainerGroupStarters = (trainers: Player[]): TrackworkStarter[] =>
    this.starters.filter(s => trainers.map(t => t.code).includes(s.trainer))

  getGradeBorderStyle = (
    race: number,
    starter: TrackworkStarter,
    index: number
  ): string => {

    if (starter.grade !== 'A') return '';

    const sortedStarters = this.getRaceStarters(race);
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

  get starters(): TrackworkStarter[] {
    return this.trackworks
      .flatMap(ts => ts.starters)
      .filter(s => !s.scratched && s?.placing)
  }

  get activeTrackwork(): TrackworkSnapshot {
    const match = this.trackworks.find(ts => ts.meeting === this.activeBadge);
    return match ? match : this.trackworks[0];
  }

  get trackworks(): TrackworkSnapshot[] {
    return this.repo.findTrackworkSnapshots();
  }

  get trainerGroups(): Player[][] {
    const boundaryTrainers = this.trainers.filter(t => t.boundary);
    const group = this.trainers
      .filter(t => t.boundary)
      .map((bt, bti) => {
        let startIndex = 0;
        let endIndex = this.trainers.findIndex(p => p === bt);

        if (bti > 0) {
          startIndex = 1 + this.trainers.findIndex(p => p === boundaryTrainers[bti - 1]);
        }

        return this.trainers.slice(startIndex, endIndex + 1);
      });

    const lastStartIndex =
      1 + this.trainers.findIndex(p => p === boundaryTrainers[boundaryTrainers.length - 1]);

    group.push(this.trainers.slice(lastStartIndex));
    return group;
  }

  get trainers(): Player[] {
    return this.repo.findPlayers().filter(p => !p.jockey);
  }

  get isLoading(): boolean {
    return this.repo.findPlayers().length === 0
      || this.repo.findTrackworkSnapshots().length < 2;
  }
}
