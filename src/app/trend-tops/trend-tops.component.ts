import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Meeting, PlayerSummary} from '../model/meeting.model';
import {formatMeeting} from '../util/functions';

const TOP_PLAYER_SIZE = 7;

@Component({
  selector: 'app-trend-tops',
  templateUrl: './trend-tops.component.html'
})
export class TrendTopsComponent implements OnInit {

  activePlayer: string = '';

  protected readonly TOP_PLAYER_SIZE = TOP_PLAYER_SIZE;
  protected readonly formatMeeting = formatMeeting;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  setActivePlayer = (clicked: string) =>
    this.activePlayer = this.activePlayer === clicked ? '' : clicked

  getAverageTurnoverPerRace = (meeting: Meeting): number =>
    parseFloat((meeting.turnover / meeting.races).toFixed(1))

  getTurnoverIntensityColor = (meeting: Meeting): string => {
    const avg = this.getAverageTurnoverPerRace(meeting);
    if (avg >= 18.5) return 'bg-blue-600';
    if (avg >= 16.5) return 'bg-green-600';
    return 'bg-red-600';
  }

  getTopPlayers = (meeting: Meeting): PlayerSummary[] => {
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

  get topConsistentPlayers(): Array<{ player: string, points: number }> {
    const today = new Date().toISOString().split('T')[0];
    let pointByPlayer: Map<string, number> = new Map();

    this.meetings
      .filter(m => m.meeting < today)
      .forEach((m, mIndex) => {
        this.getTopPlayers(m).forEach((ps, index) => {
          let points = TOP_PLAYER_SIZE - (index % TOP_PLAYER_SIZE);
          points *= ((this.meetings.length - mIndex) / this.meetings.length);

          if (pointByPlayer.has(ps.player)) {
            const newPoints = points + (pointByPlayer.get(ps.player) || 0);
            pointByPlayer.set(ps.player, newPoints);
          } else {
            pointByPlayer.set(ps.player, points);
          }
        });
      });

    return [this.trainers, this.jockeys].flatMap(category =>
      category
        .map(p => ({player: p, points: (pointByPlayer.get(p) || 0)}))
        .sort((p1, p2) => p2.points - p1.points)
        .slice(0, TOP_PLAYER_SIZE)
        .map(p => ({player: p.player, points: Math.floor(p.points)}))
    );
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
