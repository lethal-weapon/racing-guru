import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {PlayerConnection} from '../model/connection.model';
import {Player} from '../model/player.model';

@Component({
  selector: 'app-form-connection',
  templateUrl: './form-connection.component.html'
})
export class FormConnectionComponent implements OnInit {

  activePlayer: string = 'WDJ';

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchActivePlayers();
    this.repo.fetchPlayerConnections();
  }

  isRelationshipExist = (otherPlayer: string, relationship: string): boolean =>
    this.connections
      .filter(c =>
        (c.playerA === this.activePlayer && c.playerB === otherPlayer)
        ||
        (c.playerB === this.activePlayer && c.playerA === otherPlayer)
      )
      .filter(c => c.relations.includes(relationship))
      .length > 0

  toggleRelationship = (otherPlayer: string, relationship: string) => {
    if (relationship === 'MASTERS') return;

    this.repo.savePlayerConnection({
      playerA: this.activePlayer,
      playerB: otherPlayer,
      relation: relationship,
      active: !this.isRelationshipExist(otherPlayer, relationship)
    });
  }

  getRelationshipStyle = (otherPlayer: string, relationship: string): string =>
    this.isRelationshipExist(otherPlayer, relationship)
      ? `border border-gray-900 bg-gray-300 text-gray-800`
      : `bg-gray-800 border border-gray-800 transition 
         hover:border-gray-900 hover:bg-gray-300 hover:text-gray-800 opacity-50`;

  getPlayerBadgeStyle = (player: string) =>
    this.activePlayer === player
      ? `border border-gray-900 bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

  get relationships(): string[] {
    return this.connections
      .flatMap(c => c.relations)
      .filter((r, index, arr) => index === arr.indexOf(r));
  }

  get otherTrainers(): string[] {
    return this.trainers.filter(p => p != this.activePlayer);
  }

  get otherJockeys(): string[] {
    return this.jockeys.filter(p => p != this.activePlayer);
  }

  get trainers(): string[] {
    return this.players.filter(p => !p.jockey).map(p => p.code);
  }

  get jockeys(): string[] {
    return this.players.filter(p => p.jockey).map(p => p.code);
  }

  get players(): Player[] {
    return this.repo.findPlayers();
  }

  get connections(): PlayerConnection[] {
    return this.repo.findPlayerConnections();
  }

  get isLoading(): boolean {
    return this.repo.findPlayers().length === 0
      || this.repo.findPlayerConnections().length === 0;
  }
}
