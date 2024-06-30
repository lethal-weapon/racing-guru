import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Meeting} from '../model/meeting.model';
import {SEASONS} from '../util/strings';
import {Player} from '../model/player.model';

interface ChartLinePoint {
  name: string,
  value: number
}

interface ChartLine {
  name: string,
  series: ChartLinePoint[]
}

interface PlayerGroup {
  name: string,
  startIndex: number,
  endIndex: number
}

@Component({
  selector: 'app-trend-earning',
  templateUrl: './trend-earning.component.html',
})
export class TrendEarningComponent implements OnInit {
  hoveredTrainer: string = '';
  trackingMeeting: string = '';
  trackingPlayers: string[] = [];
  activePlayerGroup: PlayerGroup = this.playerGroups[0];
  chartData: ChartLine[] = [];

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.setActivePlayerGroup(this.playerGroups[0]);
  }

  setHoveredTrainer = (hovered: string) =>
    this.hoveredTrainer = hovered

  setActivePlayerGroup = (clicked: PlayerGroup) => {
    this.activePlayerGroup = clicked;

    const players = this.trainers
      .find(t => clicked.name.includes(t.code)) ? this.trainers : this.jockeys;

    this.trackingPlayers = players
      .filter((_, i) => i >= clicked.startIndex && i <= clicked.endIndex)
      .map(p => p.code);

    this.updateChart();
  }

  toggleTrackingPlayer = (player: string) => {
    if (this.trackingPlayers.includes(player)) {
      this.trackingPlayers = this.trackingPlayers.filter(p => p !== player);
    } else {
      this.trackingPlayers.push(player);
    }
    this.updateChart();
  }

  updateChart = () => {
    this.chartData = this.trackingPlayers.map(player => {
      let series = this.meetings
        .map(m => m.meeting)
        .filter(m => m >= SEASONS[0].opening)
        .sort((m1, m2) => m1.localeCompare(m2))
        .map((m, index) => ({
          name: `${index + 1}`,
          value: this.getPlayerEarningUpToMeeting(player, m)
        }));

      return {name: player, series: series};
    });
  }

  handleTrackingControls = (control: string) => {
    const meetingsInRange = this.meetings
      .map(m => m.meeting)
      .filter(m => m >= SEASONS[0].opening)
      .sort((m1, m2) => m1.localeCompare(m2));

    const currIndex = meetingsInRange.indexOf(this.trackingMeeting);

    switch (control) {
      case 'Reset': {
        this.trackingMeeting = '';
        // this.trackingPlayers = [];
        break;
      }
      case 'Opening': {
        this.trackingMeeting = meetingsInRange[0];
        break;
      }
      case 'Prev': {
        if (currIndex === -1) {
          this.trackingMeeting = meetingsInRange[meetingsInRange.length - 2];
        } else if (currIndex > 0) {
          this.trackingMeeting = meetingsInRange[currIndex - 1];
        }
        break;
      }
      case 'Next': {
        if (currIndex !== -1 && currIndex < meetingsInRange.length - 1) {
          this.trackingMeeting = meetingsInRange[currIndex + 1];
        }
        break;
      }
      case 'Replay': {
        if (currIndex === -1) {
          this.handleTrackingControls('Opening');
          setTimeout(() => this.handleTrackingControls('Replay'), 1000);

        } else if (currIndex < meetingsInRange.length - 1) {
          this.handleTrackingControls('Next');

          if (meetingsInRange.indexOf(this.trackingMeeting) === meetingsInRange.length - 1) {
            this.handleTrackingControls('Reset');

          } else {
            setTimeout(() => this.handleTrackingControls('Replay'), 350);
          }
        }
        break;
      }
      default:
        break;
    }
  }

  getPlayerEarningUpToMeeting = (player: string, meeting: string): number => {
    return this.meetings
      .filter(m => m.meeting >= SEASONS[0].opening && m.meeting <= meeting)
      .flatMap(m => m.players)
      .filter(ps => ps.player === player)
      .map(ps =>
        ps.earnings -
        ps.starters.filter(s => s?.winOdds && s?.placing > 4).length
      )
      .reduce((e1, e2) => e1 + e2, 0);
  }

  getCollaborationEarningStyle = (jockey: string, trainer: string): string => {
    const earnings = this.getCollaborationEarning(jockey, trainer);
    return earnings < 20
      ? 'opacity-50'
      : earnings < 50 ? '' : 'text-yellow-400';
  }

  getCollaborationEarning = (jockey: string, trainer: string): number =>
    this.meetings
      .filter(m => m.meeting >= SEASONS[0].opening)
      .flatMap(m => m.players)
      .filter(ps => ps.player === jockey)
      .flatMap(ps => ps.starters)
      .filter(es => es.partner === trainer)
      .map(es => es.earning)
      .reduce((e1, e2) => e1 + e2, 0)

  getTrackingPlayerStyle = (player: string) =>
    this.trackingPlayers.includes(player)
      ? `border border-gray-900 bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

  get playerGroups(): PlayerGroup[] {
    const trainerCodes = this.trainers.map(t => t.code);
    const jockeyCodes = this.jockeys.map(t => t.code);

    const boundaryTrainerCodes = this.trainers.filter(t => t.boundary).map(t => t.code);
    const boundaryJockeyCodes = this.jockeys.filter(t => t.boundary).map(t => t.code);

    return [
      [trainerCodes, boundaryTrainerCodes],
      [jockeyCodes, boundaryJockeyCodes]
    ]
      .map(pair => {
        const players = pair[0];
        const boundaryPlayers = pair[1];

        let groups = boundaryPlayers.map((bt, bti) => {
          let startIndex = 0;
          let endIndex = players.findIndex(p => p === bt);

          if (bti > 0) {
            startIndex = 1 + players.findIndex(p => p === boundaryPlayers[bti - 1]);
          }

          return {
            name: `Group ${players[startIndex]}`,
            startIndex: startIndex,
            endIndex: endIndex
          }
        });

        let lastStartIndex =
          1 + players.findIndex(p => p === boundaryPlayers[boundaryPlayers.length - 1]);

        groups.push({
          name: `Group ${players[lastStartIndex]}`,
          startIndex: lastStartIndex,
          endIndex: players.length - 1
        });

        return groups;
      })
      .flatMap(p => p);
  }

  get playerEarnings(): Array<Array<{ player: string, earnings: number[] }>> {
    return [this.trainers, this.jockeys].map(pl =>
      pl.map(p => {
        const seasonEarnings = SEASONS
          .map((s, index) =>
            this.meetings
              .filter(m => m.meeting >= s.opening && m.meeting <=
                (
                  (index == 0 && this.trackingMeeting.length > 0)
                    ? this.trackingMeeting : s.finale
                )
              )
              .flatMap(m => m.players)
              .filter(ps => ps.player === p.code)
              .map(ps => ps.earnings)
              .reduce((prev, curr) => prev + curr, 0)
          )
          .map(e => Math.floor(e));

        return {
          player: p.code,
          earnings: seasonEarnings
        };
      })
        .sort((p1, p2) =>
          (p2.earnings[0] - p1.earnings[0]) ||
          (p2.earnings[1] - p1.earnings[1]) ||
          (p1.player.localeCompare(p2.player))
        )
    );
  }

  get currentSeasonProgress(): string {
    const startMeeting = SEASONS[0].opening;
    const endMeeting = this.trackingMeeting.length > 0
      ? this.trackingMeeting
      : SEASONS[0].finale;

    const currentSeasonMeetings = this.meetings
      .filter(m => m.meeting >= startMeeting && m.meeting <= endMeeting)
      .length;

    return `${Math.ceil(100 * currentSeasonMeetings / 88)}%`;
  }

  get trackingControls(): string[] {
    return ['Reset', 'Replay', 'Opening', 'Prev', 'Next'];
  }

  get trackingControlStyle(): string {
    return `mx-auto px-4 pt-1.5 pb-2 text-lg rounded-full cursor-pointer
            border border-gray-600 hover:border-yellow-400`;
  }

  get trainers(): Player[] {
    return this.repo.findPlayers().filter(p => !p.jockey);
  }

  get jockeys(): Player[] {
    return this.repo.findPlayers().filter(p => p.jockey);
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }
}
