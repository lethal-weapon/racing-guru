import {Component, OnInit} from '@angular/core';

import {Collaboration, DEFAULT_COLLABORATION} from '../model/collaboration.model';
import {RestRepository} from '../model/rest.repository';
import {JOCKEYS, TRAINERS} from '../model/person.model';

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html'
})
export class CollaborationComponent implements OnInit {
  hoveredTrainer: string = '';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchCollaborations();
  }

  setHoveredTrainer = (hovered: string) =>
    this.hoveredTrainer = hovered;

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
      'BA', 'PMF', 'CLR', 'WDJ', 'YTP', 'TKH'
    ].includes(person);
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