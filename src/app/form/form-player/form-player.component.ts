import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {CareerWin, DEFAULT_PLAYER, Player} from '../../model/player.model';
import {LICENCES, NATIONALITIES} from '../../util/strings';
import {ONE_DAY_MILL} from '../../util/numbers';

@Component({
  selector: 'app-form-player',
  templateUrl: './form-player.component.html'
})
export class FormPlayerComponent implements OnInit {
  editingStatus: string = 'Unchanged';
  editingPlayer: Player = {...DEFAULT_PLAYER};

  protected readonly LICENCES = LICENCES;
  protected readonly NATIONALITIES = NATIONALITIES;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchPlayers(
      (players) => {
        if (players.length > 0) {
          this.editingPlayer = {...players[0]};
        }
      }
    );
  }

  addCareerWin = () => {
    this.editingPlayer.careerWins.push({upToDate: '2000-01-01', wins: 99});
  }

  deleteCareerWin = (career: CareerWin) => {
    if (this.editingPlayer.careerWins.length > 1) {
      this.editingPlayer.careerWins =
        this.editingPlayer.careerWins.filter(cw => cw !== career);
    }
  }

  savePlayer = () => {
    this.editingStatus = 'Saving';
    setTimeout(() => {
      this.repo.savePlayer(
        this.editingPlayer,
        () => {
          this.editingStatus = 'Saved';
        },
        () => {
          this.editingStatus = 'Error';
        }
      )
    }, 500);
  }

  get editStatusColor(): string {
    switch (this.editingStatus) {
      case 'Unchanged':
        return '';
      case 'Saving':
        return 'text-yellow-400';
      case 'Saved':
        return 'text-green-600';
      case 'Error':
        return 'text-red-600';
      default:
        return '';
    }
  }

  get editingAge(): string {
    const now = new Date().getTime();
    const dob = new Date(this.editingPlayer.dateOfBirth).getTime();
    const diffDays = (now - dob) / ONE_DAY_MILL;
    return (diffDays / 365).toFixed(1);
  }

  get isPlaceholderPlayer(): boolean {
    return this.editingPlayer.code === 'XXX';
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
        ((p2.active ? 1 : 0) - (p1.active ? 1 : 0))
        ||
        (p1?.order || 0 - p2?.order || 0)
      );
  }
}