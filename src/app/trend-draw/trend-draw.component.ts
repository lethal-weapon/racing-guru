import {Component, OnDestroy, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Meeting} from '../model/meeting.model';
import {DrawInheritance, DrawPlacingPerformance} from '../model/draw.model';
import {BG_COLORS, COLORS, PLACING_MAPS} from '../util/strings';
import {MAX_RACE_PER_MEETING, ONE_MINUTE} from '../util/numbers';
import {formatMeeting, formatRace, isBoundaryMeeting} from '../util/functions';

@Component({
  selector: 'app-trend-draw',
  templateUrl: './trend-draw.component.html'
})
export class TrendDrawComponent implements OnInit, OnDestroy {

  loopIntervalId: any;

  protected readonly COLORS = COLORS;
  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;
  protected readonly formatRace = formatRace;
  protected readonly formatMeeting = formatMeeting;
  protected readonly isBoundaryMeeting = isBoundaryMeeting;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchDrawInheritances(16);

    this.loopIntervalId = setInterval(() => {
      this.repo.fetchLatestDrawInheritances();
    }, ONE_MINUTE);
  }

  ngOnDestroy(): void {
    if (this.loopIntervalId) clearInterval(this.loopIntervalId);
  }

  isInherited = (meeting: string, race: number, placing: number): boolean =>
    this.drawInheritances
      .filter(d => d.meeting === meeting && d.race === race)
      .some(d => d.draws.some(dd => dd.inherit && dd.placing === placing))

  isMultipleInheritance = (mostRecentRace: number): boolean => {
    if (this.sortedInheritances.length < mostRecentRace) return false;
    return this.sortedInheritances[mostRecentRace - 1].inheritance > 1;
  }

  getBackgroundColor = (mostRecentRace: number, placing: number): string => {
    if (this.sortedInheritances.length < mostRecentRace) return 'bg-gray-700';

    const drawInheritance = this.sortedInheritances[mostRecentRace - 1];
    if (drawInheritance.inheritance < 1) return 'bg-gray-700';

    const matched = drawInheritance.draws
      .find(d => d.inherit && d.placing === placing);

    return matched ? BG_COLORS[placing - 1] : 'bg-gray-700';
  }

  getDraw = (meeting: string, race: number, placing: number): number => {
    const drawInheritance = this.drawInheritances
      .find(d => d.meeting === meeting && d.race === race);

    if (!drawInheritance) return 0;
    return drawInheritance.draws.find(d => d.placing === placing)?.draw || 0;
  }

  getDrawOdds = (meeting: string, race: number, placing: number): number => {
    const draw = this.getDraw(meeting, race, placing);
    return (this.meetings.find(m => m.meeting === meeting)?.players || [])
      .flatMap(ps => ps.starters)
      .filter(s => s.race === race && s.draw === draw)
      .shift()?.winOdds || 0;
  }

  getDrawPlacingCount = (meeting: string, placing: number): number =>
    this.drawInheritances
      .filter(d => d.meeting === meeting)
      .flatMap(d => d.draws)
      .filter(d => d.inherit && d.placing === placing)
      .length

  getRacesOnMeeting = (meeting: string): number[] =>
    this.drawInheritances
      .filter(d => d.meeting === meeting)
      .map(d => d.race)
      .sort((r1, r2) => r2 - r1)

  getDrawPlacingPerformance = (meeting: string, race: number): DrawPlacingPerformance[] =>
    this.getDrawPerformance(meeting, race)?.draws || []

  getDrawPerformance = (meeting: string, race: number): DrawInheritance | undefined =>
    this.drawInheritances.find(d => d.meeting === meeting && d.race === race)

  get maxMostRecentRace(): number {
    return 88;
  }

  get sortedInheritances(): DrawInheritance[] {
    return this.drawInheritances
      .map(d => d)
      .sort((d1, d2) =>
        d2.meeting.localeCompare(d1.meeting)
        ||
        d2.race - d1.race
      );
  }

  get drawInheritances(): DrawInheritance[] {
    return this.repo.findDrawInheritances();
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }

  get isLoading(): boolean {
    return this.repo.findMeetings().length === 0
      || this.repo.findDrawInheritances().length === 0;
  }
}
