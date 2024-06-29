import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-trend-draw',
  templateUrl: './trend-draw.component.html'
})
export class TrendDrawComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  // getDrawPlacingPerformance = (meeting: string, race: number): DrawPlacingPerformance[] =>
  //   this.getDrawPerformance(meeting, race)?.draws || []
  //
  // getDrawPerformance = (meeting: string, race: number): DrawInheritance | undefined =>
  //   this.repo.findDrawInheritances()
  //     .find(d => d.meeting === meeting && d.race === race);
  //
  // getDrawPerformanceByPlacing = (period: string): Array<{ races: number, hits: number }> => {
  //   let meetings = this.meetings.map(m => m.meeting);
  //   if (period === 'Recent 10 Meetings') {
  //     meetings = this.meetings
  //       .filter((_, i) => i > 0)
  //       .map(m => m.meeting)
  //       .slice(0, 10);
  //
  //   } else if (SEASONS.map(s => s.label).some(l => period.includes(l))) {
  //     const season = SEASONS.find(s => period.includes(s.label))
  //     meetings = this.meetings
  //       .filter((_, i) => i > 0)
  //       .map(m => m.meeting)
  //       .filter(m => m >= (season?.opening || '') && m <= (season?.finale || ''));
  //   }
  //
  //   const performances = this.repo
  //     .findDrawInheritances()
  //     .filter(p => meetings.includes(p.meeting))
  //     .filter(p => p.draws.length > 0);
  //
  //   const dpByPlacings = PLACING_MAPS.map((_, index) => ({
  //     races: performances.length,
  //     hits: performances.filter(p =>
  //       p.draws.some(d => d.inherit && d.placing == index + 1)).length
  //   }));
  //
  //   return [
  //     ...dpByPlacings,
  //     {
  //       races: performances.length,
  //       hits: performances.filter(p => p.inheritance > 0).length
  //     }
  //   ];
  // }
  //
  // getDrawPerformanceByPeriod = (period: string): Array<{ races: number, hits: number }> => {
  //   let meetings = this.meetings.map(m => m.meeting);
  //   if (period === 'Recent 10 Meetings') {
  //     meetings = this.meetings
  //       .filter((_, i) => i > 0)
  //       .map(m => m.meeting)
  //       .slice(0, 10);
  //
  //   } else if (SEASONS.map(s => s.label).some(l => period.includes(l))) {
  //     const season = SEASONS.find(s => period.includes(s.label))
  //     meetings = this.meetings
  //       .filter((_, i) => i > 0)
  //       .map(m => m.meeting)
  //       .filter(m => m >= (season?.opening || '') && m <= (season?.finale || ''));
  //   }
  //
  //   return this.drawPerformanceVenues.map(v => {
  //     let performances = this.repo.findDrawInheritances();
  //     if (v !== 'Total') {
  //       performances = this.repo.findDrawInheritances().filter(p => p.venue === v);
  //     }
  //
  //     performances = performances
  //       .filter(p => meetings.includes(p.meeting))
  //       .filter(p => p.draws.length > 0);
  //
  //     return {
  //       races: performances.length,
  //       hits: performances.filter(p => p.inheritance > 1).length
  //     }
  //   });
  // }
  //

  // get drawPerformancePeriods(): string[] {
  //   return ['Recent 10 Meetings', 'Season 23/24', 'Season 22/23', 'Total'];
  // }
  //
  // get drawPerformanceVenues(): string[] {
  //   return ['HV', 'ST', 'Total'];
  // }

}
