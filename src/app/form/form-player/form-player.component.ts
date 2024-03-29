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

  activeSection: string = this.sections[0];
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

  setActivePlayer = (player: Player) =>
    this.editingPlayer = {...player}

  addNewPlayer = (isJockey: boolean) =>
    this.editingPlayer = {
      ...DEFAULT_PLAYER,
      jockey: isJockey,
      order: 1 + (
        (isJockey ? this.jockeys : this.trainers)
          .map(p => p.order)
          .sort((o1, o2) => o1 - o2)
          .pop() || 0
      )
    }

  addCareerWin = () =>
    this.editingPlayer.careerWins.push({upToDate: '2022-09-01', wins: 0})

  deleteCareerWin = (career: CareerWin) => {
    if (this.editingPlayer.careerWins.length > 1) {
      this.editingPlayer.careerWins =
        this.editingPlayer.careerWins.filter(cw => cw !== career);
    }
  }

  savePlayer = () => {
    if (!this.isValidPlayer) return;

    this.editingStatus = 'Saving';
    setTimeout(() => {
      this.repo.savePlayer(
        this.editingPlayer,
        (saved: Player) => {
          this.editingPlayer = {...saved};
          this.editingStatus = 'Saved';
        },
        () => this.editingStatus = 'Error'
      );
    }, 500);
  }

  getBadgeStyle = (player: Player): string =>
    this.editingPlayer.code === player.code
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400`

  getSectionStyle = (section: string): string =>
    this.activeSection === section
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

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

  get isValidPlayer(): boolean {
    if (this.editingPlayer.code.length < 2) return false;

    return true;
  }

  get sections(): string[] {
    return ['Active', 'Inactive'];
  }

  get trainers(): Player[] {
    return this.players.filter(p => !p.jockey);
  }

  get jockeys(): Player[] {
    return this.players.filter(p => p.jockey);
  }

  get players(): Player[] {
    return this.repo.findPlayers()
      .filter(p => this.activeSection === this.sections[0] ? p.active : !p.active)
      .sort((p1, p2) =>
        ((p2.active ? 1 : 0) - (p1.active ? 1 : 0))
        ||
        (p1?.order || 0 - p2?.order || 0)
      );
  }
}