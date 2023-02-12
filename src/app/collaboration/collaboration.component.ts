import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {Collaboration, CollaborationStarter, DEFAULT_COLLABORATION}
  from '../model/collaboration.model';

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html'
})
export class CollaborationComponent implements OnInit {
  hoveredTrainer: string = '';
  activePerson: string = 'WDJ';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchCollaborations();
  }

  setActivePerson = (clicked: string) =>
    this.activePerson = clicked;

  setHoveredTrainer = (hovered: string) =>
    this.hoveredTrainer = hovered;

  getStarterTooltip(starter: CollaborationStarter | undefined): string {
    if (!starter) return '';
    return `
      <div class="w-32 text-center">
        <div>${starter.meeting} #${starter.race}</div>
        <div>${starter.horseNameCH}</div>
      </div>
    `
  }

  getDisplayTooltip(jockey: string, trainer: string): string {
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

  getDisplay(jockey: string, trainer: string)
    : Array<{ value: number, style: string }> {

    const coll = this.getCollaboration(jockey, trainer);
    return [coll.wins, coll.total].map((v, index) => {
      let style = '';
      if (index === 0 && v >= 3) style = 'text-red-600';
      if (index === 1 && v >= 20) style = 'text-yellow-400';
      if (index === 1 && v <= 10 && coll.wins === 0) style = 'text-gray-700';
      return {
        value: v,
        style: style
      }
    })
  }

  getCollaboration(jockey: string, trainer: string): Collaboration {
    return this.collaborations
      .filter(c => c.jockey === jockey && c.trainer === trainer)
      .pop() || DEFAULT_COLLABORATION
  }

  isBoundaryPerson(person: string): boolean {
    return [
      'BA', 'CCY', 'CLR', 'WDJ', 'YTP', 'TKH'
    ].includes(person);
  }

  isSpecialRace(meeting: string, race: number): boolean {
    if (meeting === '2022-11-20' && race === 9) return true;
    if (meeting === '2022-12-24' && race === 5) return true;
    return false;
  }

  getPlacingColor(starter: CollaborationStarter | undefined): string {
    if (!starter) return ''
    switch (starter?.placing) {
      case 1:
        return 'text-red-600'
      case 2:
        return 'text-green-600'
      case 3:
        return 'text-blue-600'
      case 4:
        return 'text-purple-600'
      case null:
      case undefined: {
        if (this.isSpecialRace(starter.meeting, starter.race)) {
          return '';
        }
        return 'text-yellow-400';
      }
      default:
        return ''
    }
  }

  getStarter(partner: string, row: number): CollaborationStarter | undefined {
    const starters = (
      this.collaborations
        .filter(c => [c.jockey, c.trainer].includes(this.activePerson))
        .filter(c => [c.jockey, c.trainer].includes(partner))
        .pop()
        ?.starters || []
    ).sort((r1, r2) =>
      r2.meeting.localeCompare(r1.meeting) || r2.race - r1.race
    );

    const index = row - 1;
    return index < starters.length ? starters[index] : undefined;
  }

  get maxPartnerRows(): number {
    return this.partners.map(p => {
      return this.collaborations
        .filter(c => [c.jockey, c.trainer].includes(this.activePerson))
        .filter(c => [c.jockey, c.trainer].includes(p))
        .pop()
        ?.starters.length || 0
    }).sort((n1, n2) => n1 - n2).pop() || 3;
  }

  get partners(): string[] {
    const people = this.jockeys.concat(this.trainers);

    return this.collaborations
      .filter(c => [c.jockey, c.trainer].includes(this.activePerson))
      .map(c => c.jockey === this.activePerson ? c.trainer : c.jockey)
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .filter(p => people.includes(p))
      .map(p => {
        const partnerships = this.collaborations
          .filter(c => [c.jockey, c.trainer].includes(this.activePerson))
          .filter(c => [c.jockey, c.trainer].includes(p))
          .pop()
          ?.starters.length || 0;
        return {
          partner: p,
          partnerships: partnerships
        }
      })
      .sort((p1, p2) =>
        p2.partnerships - p1.partnerships ||
        people.indexOf(p1.partner) - people.indexOf(p2.partner)
      )
      .map(p => p.partner);
  }

  get activePersonName(): string {
    const person = JOCKEYS.concat(TRAINERS)
      .filter(p => p.code === this.activePerson)
      .pop();

    if (!person) return '?';
    return `${person.lastName}, ${person.firstName}`;
  }

  get jockeys(): string[] {
    return JOCKEYS.map(j => j.code);
  }

  get trainers(): string[] {
    return TRAINERS.map(t => t.code);
  }

  get collaborations(): Collaboration[] {
    return this.repo.findCollaborations();
  }
}