import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {WebsocketService} from '../websocket.service';
import {RestRepository} from '../model/rest.repository';
import {DEFAULT_PICK, Pick, Selection} from '../model/pick.model';
import {DEFAULT_RECOMMENDATION, RaceRecommendation, Recommendation} from '../model/recommendation.model';
import {toRelativeTime} from '../util/functions';
import {Racecard} from '../model/racecard.model';

@Component({
  selector: 'app-reserved',
  templateUrl: './reserved.html'
})
export class ReservedComponent implements OnInit {
  pick: Pick = DEFAULT_PICK;
  recommendation: Recommendation = DEFAULT_RECOMMENDATION;
  racecards: Racecard[] = [];

  activeRace: number = 1;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService,
    private clipboard: Clipboard
  ) {

  }

  ngOnInit(): void {
  }

  resetSelections = () => {
    let newPick: Pick = {...this.pick, races: [...this.pick.races]};
    let newRacePick = newPick.races.find(r => r.race === this.activeRace);
    if (!newRacePick) return;

    newRacePick.selections = [];
    this.repo.savePick(newPick);
  }

  copyRecommendationBets = (isCopyAll: boolean, betline: string) => {
    if (isCopyAll) {
      const betlines = this.activeRecommendation.bets.map(b => b.betline).join(';');
      this.clipboard.copy(betlines);
    } else {
      this.clipboard.copy(betline);
    }
  }

  copyMultiBankerBets = (betType: string) => {
    const ordersByPlacing = Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(p =>
        this.activeSelections
          .filter(s => s.placing === p)
          .map(s => s.order)
          .sort((o1, o2) => o1 - o2)
          .join()
      );

    let fmb = `fmb:${ordersByPlacing.slice(0, 2).join('>')}`;
    let tmb = `tmb:${ordersByPlacing.slice(0, 3).join('>')}`;
    let qmb = `qmb:${ordersByPlacing.join('>')}`;

    const fctBets = this.getMultiBankerBets('FMB').length;
    const tceBets = this.getMultiBankerBets('TMB').length;
    const qttBets = this.getMultiBankerBets('QMB').length;

    if (fctBets <= 12) fmb = fmb.concat(`/$10`);
    else fmb = fmb.concat(`|$120`);

    if (tceBets <= 12) tmb = tmb.concat(`/$10`);
    else if (tceBets <= 18) tmb = tmb.concat(`/$8`);
    else if (tceBets <= 24) tmb = tmb.concat(`/$6`);
    else if (tceBets <= 30) tmb = tmb.concat(`/$5`);
    else if (tceBets <= 36) tmb = tmb.concat(`/$4`);
    else if (tceBets <= 48) tmb = tmb.concat(`/$3`);
    else tmb = tmb.concat(`/$2`);

    if (qttBets <= 16) qmb = qmb.concat(`/$10`);
    else if (qttBets <= 24) qmb = qmb.concat(`/$6`);
    else if (qttBets <= 30) qmb = qmb.concat(`/$5`);
    else if (qttBets <= 36) qmb = qmb.concat(`/$4`);
    else if (qttBets <= 48) qmb = qmb.concat(`/$3`);
    else if (qttBets <= 72) qmb = qmb.concat(`/$2`);
    else qmb = qmb.concat(`/$1`);

    switch (betType) {
      case 'FMB':
        this.clipboard.copy(fmb);
        break
      case 'TMB':
        this.clipboard.copy(tmb);
        break
      case 'QMB':
        this.clipboard.copy(qmb);
        break
      case 'ALL':
        this.clipboard.copy([fmb, tmb, qmb].join(';'));
        break
      default:
        break
    }
  }

  getMultiBankerBets = (betType: string): number[][] => {
    let bets: number[][] = [];
    const ordersByPlacing = Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(p =>
        this.activeSelections
          .filter(s => s.placing === p)
          .map(s => s.order)
      );

    for (let i = 0; i < ordersByPlacing[0].length; i++) {
      const winner = ordersByPlacing[0][i];

      for (let j = 0; j < ordersByPlacing[1].length; j++) {
        const second = ordersByPlacing[1][j];
        if (second == winner) continue;

        if (betType === 'FMB') {
          bets.push([winner, second]);
          continue;
        }

        for (let k = 0; k < ordersByPlacing[2].length; k++) {
          const third = ordersByPlacing[2][k];
          if ([winner, second].includes(third)) continue;

          if (betType === 'TMB') {
            bets.push([winner, second, third]);
            continue;
          }

          for (let l = 0; l < ordersByPlacing[3].length; l++) {
            const fourth = ordersByPlacing[3][l];
            if ([winner, second, third].includes(fourth)) continue;
            bets.push([winner, second, third, fourth]);
          }
        }
      }
    }

    return bets;
  }

  get controlButtonStyle(): string {
    return `px-2 pt-1 pb-1.5 rounded-xl border border-gray-600 ` +
      `hover:border-yellow-400 cursor-pointer`;
  }

  get activeSelections(): Selection[] {
    return this.pick.races.find(r => r.race === this.activeRace)?.selections || [];
  }

  get activeRecommendationCombinations(): number {
    return this.activeRecommendation.bets
      .map(b => b.combinations)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get activeRecommendationTime(): string {
    const raceTime = new Date(this.activeRacecard.time);
    return toRelativeTime(raceTime, this.activeRecommendation.computedAt);
  }

  get activeRecommendation(): RaceRecommendation {
    // @ts-ignore
    return this.recommendation.races.find(r => r.race === this.activeRace);
  }

  get activeRacecard(): Racecard {
    // @ts-ignore
    return this.racecards.find(r => r.race === this.activeRace);
  }

  get multiBankerBetTypes(): string[] {
    return ['ALL', 'FMB', 'TMB', 'QMB'];
  }
}
