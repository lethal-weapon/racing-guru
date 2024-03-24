import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {DEFAULT_PLAYER, Player} from '../../model/player.model';
import {LICENCES, NATIONALITIES} from '../../util/strings';
import {ONE_DAY_MILL} from '../../util/numbers';

@Component({
  selector: 'app-form-player',
  templateUrl: './form-player.component.html'
})
export class FormPlayerComponent implements OnInit {
  editingPlayer: Player = {...DEFAULT_PLAYER};

  protected readonly LICENCES = LICENCES;
  protected readonly NATIONALITIES = NATIONALITIES;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchPlayers();
  }

  // isHighlightWinners = (wins: number): boolean => {
  //   const closeToFifty = Math.abs(50 - wins % 50) <= 5;
  //   const endWith489 = [4, 8, 9].includes(wins % 10);
  //
  //   return closeToFifty || endWith489;
  // }

  // getWinners = (person: Player): number =>
  //   this.repo.findCollaborations()
  //     .filter(c => [c.jockey, c.trainer].includes(person.code))
  //     .map(c => c.wins)
  //     .reduce((prev, curr) => prev + curr, person.careerWins)

  get editingAge(): string {
    const now = new Date().getTime();
    const dob = new Date(this.editingPlayer.dateOfBirth).getTime();
    const diffDays = (now - dob) / ONE_DAY_MILL;
    return (diffDays / 365).toFixed(1);
  }

  get trainers(): Player[] {
    return this.players.filter(p => !p.jockey);
  }

  get jockeys(): Player[] {
    return this.players.filter(p => p.jockey);
  }

  get players(): Player[] {
    return this.repo.findPlayers()
      .map(p => p)
      .sort((p1, p2) =>
        ((p1.active ? 1 : 0) - (p2.active ? 1 : 0))
        ||
        (p1?.order || 0 - p2?.order || 0)
      );
  }
}