import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Meeting, PlayerSummary} from '../model/meeting.model';

const TOP_PLAYER_SIZE = 7;

@Component({
  selector: 'app-trend-tops',
  templateUrl: './trend-tops.component.html'
})
export class TrendTopsComponent implements OnInit {

  activePlayer: string = '';

  protected readonly TOP_PLAYER_SIZE = TOP_PLAYER_SIZE;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  setActivePlayer = (clicked: string) =>
    this.activePlayer = this.activePlayer === clicked ? '' : clicked;

  getAverageTurnoverPerRace = (meeting: Meeting): number =>
    parseFloat((meeting.turnover / meeting.races).toFixed(1))

  getTurnoverIntensityColor = (meeting: Meeting): string => {
    const avg = this.getAverageTurnoverPerRace(meeting);
    if (avg >= 18.5) return 'bg-blue-600';
    if (avg >= 16.5) return 'bg-green-600';
    return 'bg-red-600';
  }

  getOnBoardPlayers = (meeting: Meeting): PlayerSummary[] => {
    let board: PlayerSummary[] = [];
    [this.trainers, this.jockeys].forEach((category, index) => {
      meeting.players
        .filter(p => category.includes(p.player))
        .sort((p1, p2) => p2.earnings - p1.earnings)
        .forEach(p => {
          if (board.length < (index + 1) * TOP_PLAYER_SIZE) {
            board.push(p);
          }
        });
    });
    return board;
  }

  get trainers(): string[] {
    return this.repo.findPlayers().filter(p => !p.jockey).map(p => p.code);
  }

  get jockeys(): string[] {
    return this.repo.findPlayers().filter(p => p.jockey).map(p => p.code);
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }
}
