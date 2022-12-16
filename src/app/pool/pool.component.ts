import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {FinalPool, DEFAULT_FINAL_POOL} from '../model/pool.model';
import {ONE_MILLION} from '../constants/numbers';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html'
})
export class PoolComponent implements OnInit {
  activeSection: string = this.sections[1];
  activeGroup: string = this.poolGroups[0];

  activeMeeting: string = '2022-12-14';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchFinalPools();
  }

  setActiveMeeting = (clicked: string) =>
    this.activeMeeting = clicked

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
    let rounded = (amount / ONE_MILLION).toFixed(2);
    while (rounded.length > 0 && rounded.endsWith('0')) {
      rounded = rounded.slice(0, rounded.length - 1)
    }
    if (rounded.length > 0 && rounded.endsWith('.')) {
      rounded = rounded.slice(0, rounded.length - 1)
    }
    return rounded
  }

  getTimePool(meeting: string, race: number, point: number): FinalPool {
    if (point === 9) {
      return this.repo.findFinalPools()
        .filter(p => p.meeting === meeting && p.race === race)
        .pop() || DEFAULT_FINAL_POOL;
    }

    return DEFAULT_FINAL_POOL;
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
      9, 3, 2, 1, 0, -1, -2, -3, -5,
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