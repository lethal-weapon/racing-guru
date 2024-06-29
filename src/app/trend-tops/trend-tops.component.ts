import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-trend-tops',
  templateUrl: './trend-tops.component.html'
})
export class TrendTopsComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  //
  // get topPlayerSize(): number {
  //   return 7;
  // }
  // getOnBoardPersons = (meeting: Meeting): PlayerSummary[] => {
  //   let board: PlayerSummary[] = [];
  //   [TRAINERS, JOCKEYS].forEach((category, index) => {
  //     meeting.players
  //       .filter(p => category.map(p => p.code).includes(p.player))
  //       .sort((p1, p2) => p2.earnings - p1.earnings)
  //       .forEach(p => {
  //         if (board.length < (index + 1) * this.topPlayerSize) {
  //           board.push(p);
  //         }
  //       });
  //   });
  //   return board;
  // }
  //
  // getTurnoverIntensityColor = (meeting: Meeting): string => {
  //   const avg = this.getAverageTurnoverPerRace(meeting);
  //   if (avg >= 18.5) return 'bg-blue-600';
  //   if (avg >= 16.5) return 'bg-green-600';
  //   return 'bg-red-600';
  // }
  //
  // getAverageTurnoverPerRace = (meeting: Meeting): number =>
  //   parseFloat((meeting.turnover / meeting.races).toFixed(1))
  //
}
