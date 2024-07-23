import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Player} from '../model/player.model';
import {Meeting} from '../model/meeting.model';
import {SEASONS} from '../util/strings';
import {toPlacingColor} from '../util/functions';
import {
  Collaboration,
  CollaborationStarter,
  DEFAULT_COLLABORATION
} from '../model/collaboration.model';

@Component({
  selector: 'app-trend-collaboration',
  templateUrl: './trend-collaboration.component.html'
})
export class TrendCollaborationComponent implements OnInit {

  activePlayer: string = 'WDJ';
  hoveredTrainer: string = '';

  protected readonly toPlacingColor = toPlacingColor;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchRecentCollaborations(16);
  }

  setActivePlayer = (clicked: string) =>
    this.activePlayer = clicked

  setHoveredTrainer = (hovered: string) =>
    this.hoveredTrainer = hovered

  getCollaborationEarning = (partner: string): number =>
    this.meetings
      .filter(m => m.meeting >= SEASONS[0].opening)
      .flatMap(m => m.players)
      .filter(ps => ps.player === this.activePlayer)
      .flatMap(ps => ps.starters)
      .filter(es => es.partner === partner)
      .map(es => es.earning)
      .reduce((e1, e2) => e1 + e2, 0)

  getDisplay = (jockey: Player, trainer: Player)
    : Array<{ value: number, style: string }> => {

    const coll = this.getCollaboration(jockey, trainer);
    return [coll.wins, coll.total].map((v, index) => {
      let style = '';
      if (index === 0 && this.topWinnerCounts.includes(v)) style = 'text-red-600';
      if (index === 1 && this.topCollaborationCounts.includes(v)) style = 'text-yellow-400';
      if (index === 1 && !this.topCollaborationCounts.includes(v) && coll.wins === 0) style = 'opacity-50';
      return {
        value: v,
        style: style
      }
    });
  }

  getDisplayTooltip = (jockey: Player, trainer: Player) => {
    const coll = this.getCollaboration(jockey, trainer);
    const stat = [coll.seconds, coll.thirds, coll.fourths];
    if (stat.every(s => s === 0)) return '';

    return [
      `<div class="w-24 flex flex-row justify-evenly">`,
      coll.seconds > 0 ? `<div class="text-green-600">${coll.seconds}Q</div>` : ``,
      coll.thirds > 0 ? `<div class="text-blue-600">${coll.thirds}P</div>` : ``,
      coll.fourths > 0 ? `<div class="text-purple-600">${coll.fourths}F</div>` : ``,
      `</div>`
    ].join('');
  }

  getStarter = (partner: string, row: number): CollaborationStarter | undefined => {
    const starters = (
      this.collaborations
        .filter(c => [c.jockey, c.trainer].includes(this.activePlayer))
        .filter(c => [c.jockey, c.trainer].includes(partner))
        .pop()
        ?.starters || []
    ).sort((r1, r2) =>
      r2.meeting.localeCompare(r1.meeting) || r2.race - r1.race
    );

    const index = row - 1;
    return index < starters.length ? starters[index] : undefined;
  }

  getStarterTooltip = (starter: CollaborationStarter | undefined): string => {
    if (!starter) return '';
    return `
      <div class="w-32 text-center">
        <div>${starter.meeting} #${starter.race}</div>
        <div>${starter.horseNameCH}</div>
      </div>
    `
  }

  getCollaboration = (jockey: Player, trainer: Player): Collaboration =>
    this.collaborations.find(c => c.jockey === jockey.code && c.trainer === trainer.code)
    || DEFAULT_COLLABORATION

  get partners(): string[] {
    const jockeyCodes = this.jockeys.map(j => j.code);
    const trainerCodes = this.trainers.map(j => j.code);
    const people = jockeyCodes.concat(trainerCodes);

    return this.collaborations
      .filter(c => [c.jockey, c.trainer].includes(this.activePlayer))
      .map(c => c.jockey === this.activePlayer ? c.trainer : c.jockey)
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .filter(p => people.includes(p))
      .map(p => {
        const partnerships = this.collaborations
          .filter(c => [c.jockey, c.trainer].includes(this.activePlayer))
          .filter(c => [c.jockey, c.trainer].includes(p))
          .pop()
          ?.starters.length || 0;
        return {
          partner: p,
          partnerships: partnerships
        }
      })
      .sort((p1, p2) =>
        p2.partnerships - p1.partnerships
        ||
        people.indexOf(p1.partner) - people.indexOf(p2.partner)
      )
      .map(p => p.partner);
  }

  get maxPartnerRows(): number {
    return this.partners
      .map(p => {
        return this.collaborations
          .filter(c => [c.jockey, c.trainer].includes(this.activePlayer))
          .filter(c => [c.jockey, c.trainer].includes(p))
          .pop()
          ?.starters.length || 0
      })
      .sort((n1, n2) => n1 - n2).pop() || 3;
  }

  get topWinnerCounts(): number[] {
    return this.collaborations
      .map(c => c.wins)
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .sort((w1, w2) => w2 - w1)
      .slice(0, 5);
  }

  get topCollaborationCounts(): number[] {
    return this.collaborations
      .map(c => c.total)
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .sort((w1, w2) => w2 - w1)
      .slice(0, 10);
  }

  get activePlayerName(): string {
    const player = this.repo.findPlayers()
      .find(p => p.code === this.activePlayer);

    if (!player) return '';
    return `${player.lastName}, ${player.firstName}`;
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }

  get collaborations(): Collaboration[] {
    return this.repo.findCollaborations();
  }

  get trainers(): Player[] {
    return this.repo.findPlayers().filter(p => !p.jockey);
  }

  get jockeys(): Player[] {
    return this.repo.findPlayers().filter(p => p.jockey);
  }
}
