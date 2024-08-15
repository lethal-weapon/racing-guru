import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Player} from '../model/player.model';
import {ChartLine} from '../model/chart.model';
import {
  AccumulatedPlayerEarning,
  AccumulatedSeasonEarning
} from '../model/earning.model';

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

  chartData: ChartLine[] = [];
  trackingMeeting: string = '';
  trackingPlayers: string[] = [];
  activePlayerGroup: PlayerGroup = this.playerGroups[0];

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.setActivePlayerGroup(this.playerGroups[0]);

    this.repo.fetchAccumulatedSeasonEarnings(() => this.updateChart());
  }

  setActivePlayerGroup = (clicked: PlayerGroup) => {
    this.activePlayerGroup = clicked;

    const players = this.trainers
      .find(t => clicked.name.includes(t.code)) ? this.trainers : this.jockeys;

    this.trackingPlayers = players
      .filter((_, i) => i >= clicked.startIndex && i <= clicked.endIndex)
      .map(p => p.code);
  }

  clickPlayerGroup = (clicked: PlayerGroup) => {
    this.setActivePlayerGroup(clicked);
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
      const series = (
        this.currentSeasonPlayerEarnings
          .find(pe => pe.player === player)
          ?.meetings || []
      )
        .map(m => ({
          name: `${m.meetingOrdinal}`,
          value: m.enhancedEarnings
        }));

      return {name: player, series: series};
    });
  }

  handleTrackingControls = (control: string) => {
    const meetingsInRange = this.meetings
      .map(m => m)
      .sort((m1, m2) => m1.localeCompare(m2));

    const currIndex = meetingsInRange.indexOf(this.trackingMeeting);

    switch (control) {
      case 'Reset': {
        this.trackingMeeting = '';
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
        const seasonEarnings = [0, 1].map(i => {
          const earning = (
            this.repo
              .findAccumulatedSeasonEarnings()[i]
              .players
              .find(ape => ape.player === p.code)
              ?.meetings || []
          )
            .filter(m =>
              (i === 0 && this.trackingMeeting.length > 0)
                ? m.upToMeeting <= this.trackingMeeting
                : true
            )
            .pop()
            ?.earnings || 0;

          return Math.floor(earning);
        });

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
    const count = this.meetings
      .filter(m =>
        this.trackingMeeting.length > 0
          ? m <= this.trackingMeeting
          : true
      )
      .length;

    return `${Math.ceil(100 * count / 88)}%`;
  }

  get trackingControls(): string[] {
    return ['Reset', 'Replay', 'Opening', 'Prev', 'Next'];
  }

  get trackingControlStyle(): string {
    return `mx-auto px-4 pt-1.5 pb-2 text-lg rounded-full cursor-pointer
            border border-gray-600 hover:border-yellow-400`;
  }

  get meetings(): string[] {
    return this.currentSeasonPlayerEarnings[0].meetings.map(m => m.upToMeeting);
  }

  get currentSeasonPlayerEarnings(): AccumulatedPlayerEarning[] {
    return this.currentSeasonEarning.players;
  }

  get currentSeasonEarning(): AccumulatedSeasonEarning {
    return this.repo.findAccumulatedSeasonEarnings()[0];
  }

  get trainers(): Player[] {
    return this.repo.findPlayers().filter(p => !p.jockey);
  }

  get jockeys(): Player[] {
    return this.repo.findPlayers().filter(p => p.jockey);
  }

  get isLoading(): boolean {
    return this.repo.findAccumulatedSeasonEarnings().length === 0;
  }
}
