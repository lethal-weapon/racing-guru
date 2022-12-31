import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {FinalPool, DEFAULT_FINAL_POOL, TimePool} from '../model/pool.model';
import {ONE_MILLION} from '../constants/numbers';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html'
})
export class PoolComponent implements OnInit {
  activeSection: string = this.sections[0];
  activeGroup: string = this.poolGroups[0];

  activeMeeting: string = '2023-01-01';
  timeSeriesViewModeInAmount: boolean = false;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchFinalPools();
    this.fetchTimeSeries();
  }

  fetchTimeSeries = () => {
    this.repo.fetchTimeSeriesPools(
      this.activeMeeting,
      this.activeMeetingFinalRace,
      this.timePointsInMinute.filter(p => p < 9)
    )
  }

  toggleTimeSeriesViewMode = () =>
    this.timeSeriesViewModeInAmount = !this.timeSeriesViewModeInAmount

  setActiveMeeting(clicked: string) {
    if (this.activeMeeting != clicked) {
      this.activeMeeting = clicked;
      this.fetchTimeSeries();
    }
  }

  setActiveSectionGroup(clicked: string) {
    if (this.sections.includes(clicked)) this.activeSection = clicked;
    else if (this.poolGroups.includes(clicked)) this.activeGroup = clicked;
  }

  getMeetingStyle(meeting: string): string {
    return meeting == this.activeMeeting
      ? 'text-yellow-400 border-yellow-400'
      : 'border-gray-700 hover:text-yellow-400 hover:border-yellow-400 cursor-pointer'
  }

  getToggleStyle(sectionGroup: string): string {
    return ![this.activeSection, this.activeGroup].includes(sectionGroup)
      ? 'border border-gray-800 hover:border-gray-600 cursor-pointer'
      : 'font-bold bg-gradient-to-r from-sky-800 to-indigo-800'
  }

  highlightTimeSeriesCell(race: number, point: number): boolean {
    if (point == -30) return true;
    const secondToTheLastRace = this.activeMeetingFinalRace - 2;

    if (point == 0 && race <= secondToTheLastRace) return true;
    return point == 2 && race > secondToTheLastRace;
  }

  formatTimePoint(point: number): string {
    if (point === 9) return 'Final';
    const sign = point <= 0 ? '' : '+';
    const minute = Math.abs(point);
    const unit = minute < 60 ? '' : 'H';
    const value = minute < 60 ? minute : minute / 60;
    return `${sign}${value}${unit}`;
  }

  formatMeeting(meeting: string): string {
    return meeting.replace(/^\d{4}-/g, '')
  }

  formatGrade(grade: string): string {
    return grade === DEFAULT_FINAL_POOL.grade ? '' : grade;
  }

  formatStarters(starters: number): string {
    return starters === DEFAULT_FINAL_POOL.starters ? '' : `${starters}`;
  }

  formatAmount(amount: number): string {
    if (amount === 0) return '';
    let rounded = (amount / ONE_MILLION).toFixed(1);

    while (rounded.length > 0 && rounded.endsWith('0')) {
      rounded = rounded.slice(0, rounded.length - 1)
    }
    if (rounded.length > 0 && rounded.endsWith('.')) {
      rounded = rounded.slice(0, rounded.length - 1)
    }

    return rounded === '0' ? '' : rounded;
  }

  formatTSAmount(final: number, amount: number, point: number): string {
    if (point === 9) return this.formatAmount(final);
    if (amount === final) return '';
    if (this.timeSeriesViewModeInAmount) return this.formatAmount(amount);
    const percent = Math.floor((amount / final) * 100).toString();
    return percent === '0' ? '' : percent;
  }

  getTimePool(meeting: string, race: number, point: number): FinalPool | TimePool {
    if (point === 9) {
      return this.repo.findFinalPools()
        .filter(p => p.meeting === meeting && p.race === race)
        .pop() || DEFAULT_FINAL_POOL;
    }

    const match = this.repo.findTimeSeriesPools()
      .filter(p => p.meeting === meeting && p.race === race)
      .pop();

    return match
      ? match.pools.filter(p => p.point === point).pop() || DEFAULT_FINAL_POOL
      : DEFAULT_FINAL_POOL;
  }

  getFinalPool(pools: FinalPool[], meeting: string, race: number): FinalPool {
    return pools
      .filter(p => p.meeting === meeting && p.race === race)
      .pop() || DEFAULT_FINAL_POOL;
  }

  getUniqueMeetings(pools: FinalPool[]): string[] {
    return pools
      .map(p => p.meeting)
      .filter((meeting, i, arr) => arr.indexOf(meeting) === i);
  }

  get recentMeetings(): Array<{ meeting: string, venue: string }> {
    const meetings = this.getUniqueMeetings(this.repo.findFinalPools()).slice(0, 8);
    return meetings.map(m => {
      // @ts-ignore
      const venue = this.repo.findFinalPools()
        .filter(p => p.meeting === m && p.race === 1)
        .pop().venue || 'HV';
      return {meeting: m, venue: venue}
    })
  }

  get timePointsInMinute(): number[] {
    return [
      9, 2, 1, 0, -1, -2, -3, -5,
      -10, -15, -20, -30, -60, -120,
      -240, -480, -960, -1440
    ]
  }

  get finalPoolGroups(): FinalPool[][] {
    const sorted = this.repo
      .findFinalPools()
      .sort((p1, p2) => new Date(p2.meeting).getTime() - new Date(p1.meeting).getTime());

    return [
      sorted.filter(p => p.venue === 'HV'),
      sorted.filter(p => p.venue !== 'HV'),
    ]
  }

  get activeMeetingFinalRace(): number {
    return this.activeMeetingFinalPools.pop()?.race || 9;
  }

  get activeMeetingFinalPools(): FinalPool[] {
    return this.repo.findFinalPools()
      .filter(p => p.meeting === this.activeMeeting)
      .sort((p1, p2) => p1.race - p2.race);
  }

  get maxRace(): number {
    return this.repo.findFinalPools()
      .map(p => p.race)
      .sort((r1, r2) => r1 - r2)
      .pop() || 10;
  }

  get sectionGroups(): string[][] {
    return [this.sections, this.poolGroups];
  }

  get poolGroups(): string[] {
    return ['WIN, PLACE & QQP', 'FT, FQ, TCE & DBL'];
  }

  get sections(): string[] {
    return ['Season Pools', 'Time Series'];
  }

}