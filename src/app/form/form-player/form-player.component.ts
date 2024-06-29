import {Component, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import {RestRepository} from '../../model/rest.repository';
import {CareerWin, DEFAULT_PLAYER, Player} from '../../model/player.model';
import {LICENCES, NATIONALITIES} from '../../util/strings';
import {ONE_DAY_MILL} from '../../util/numbers';

const ERROR = 'Error';
const SAVED = 'Saved';
const SAVING = 'Saving';
const SAVE_ORDERING = 'Save Ordering';

@Component({
  selector: 'app-form-player',
  templateUrl: './form-player.component.html',
  styleUrls: ['./form-player.component.css'],
})
export class FormPlayerComponent implements OnInit {

  jockeys: Player[] = [];
  trainers: Player[] = [];
  saveOrderText: string[] = [SAVE_ORDERING, SAVE_ORDERING];
  activeSection: string = this.sections[0];
  editingStatus: string = SAVED;
  editingPlayer: Player = {
    ...DEFAULT_PLAYER,
    careerWins: [...DEFAULT_PLAYER.careerWins]
  };

  protected readonly LICENCES = LICENCES;
  protected readonly NATIONALITIES = NATIONALITIES;
  protected readonly SAVE_ORDERING = SAVE_ORDERING;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchPlayers(
      (players) => {
        if (players.length > 0) {
          this.editingPlayer = {
            ...players[0],
            careerWins: [...players[0].careerWins]
          };
          this.initializeLocalPlayers();
        }
      }
    );
  }

  initializeLocalPlayers = () => {
    const sortedPlayers = this.repo.findPlayers()
      .filter(p => this.activeSection === this.sections[0] ? p.active : !p.active)
      .sort((p1, p2) => (p1?.order || 0 - p2?.order || 0));

    this.jockeys = sortedPlayers.filter(p => p.jockey);
    this.trainers = sortedPlayers.filter(p => !p.jockey);
  }

  dropPlayer = (event: CdkDragDrop<Player[]>, isJockeyGroup: boolean) => {
    let players = isJockeyGroup ? this.jockeys : this.trainers;
    moveItemInArray(players, event.previousIndex, event.currentIndex);

    const startingOrder = players
      .map(p => p.order)
      .sort((o1, o2) => o1 - o2)
      .shift() || 1;

    players.forEach((p, index) => p.order = startingOrder + index);
  }

  setActiveSection = (section: string) => {
    this.activeSection = section;
    this.initializeLocalPlayers();
  }

  setActivePlayer = (player: Player) =>
    this.editingPlayer = {...player, careerWins: [...player.careerWins]}

  addCareerWin = () => {
    const earliestYear = this.editingPlayer.careerWins
      .map(cw => parseInt(cw.upToDate.slice(0, 4)))
      .sort((year1, year2) => year1 - year2)
      .shift() || (new Date().getFullYear());

    this.editingPlayer.careerWins
      .push({upToDate: `${earliestYear - 1}-09-01`, wins: 0});
  }

  deleteCareerWin = (career: CareerWin) => {
    if (this.editingPlayer.careerWins.length > 1) {
      this.editingPlayer.careerWins =
        this.editingPlayer.careerWins.filter(cw => cw !== career);
    }
  }

  addNewPlayer = (isJockeyGroup: boolean) =>
    this.editingPlayer = {
      ...DEFAULT_PLAYER,
      jockey: isJockeyGroup,
      active: this.activeSection === this.sections[0],
      careerWins: [...DEFAULT_PLAYER.careerWins],
      order: 1 + (
        (isJockeyGroup ? this.jockeys : this.trainers)
          .map(p => p.order)
          .sort((o1, o2) => o1 - o2)
          .pop() || 0
      )
    }

  savePlayer = () => {
    if (!this.isValidPlayer) return;

    this.editingStatus = SAVING;
    setTimeout(() => {
      this.repo.savePlayer(
        this.editingPlayer,
        (saved: Player) => {
          this.editingPlayer = {...saved, careerWins: [...saved.careerWins]};
          this.editingStatus = SAVED;
          this.initializeLocalPlayers();
        },
        () => this.editingStatus = ERROR
      );
    }, 500);
  }

  saveOrdering = (isJockeyGroup: boolean, index: number) => {
    if (this.saveOrderText[index] !== SAVE_ORDERING) return;

    this.saveOrderText[index] = SAVING;
    setTimeout(() => {
      this.repo.savePlayerOrders(
        isJockeyGroup ? this.jockeys : this.trainers,
        (saved: Player[]) => {
          const savedIndex = saved.findIndex(s => s.code === this.editingPlayer.code);
          if (savedIndex !== -1) {
            this.editingPlayer = {
              ...saved[savedIndex],
              careerWins: [...saved[savedIndex].careerWins]
            };
          }
          this.saveOrderText[index] = SAVED;
          setTimeout(() => this.saveOrderText[index] = SAVE_ORDERING, 2_500);
        },
        () => {
          this.saveOrderText[index] = ERROR;
          setTimeout(() => this.saveOrderText[index] = SAVE_ORDERING, 5_000);
        }
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

  getStatusColor = (status: string): string => {
    switch (status) {
      case SAVING:
        return 'text-yellow-400';
      case SAVED:
        return 'text-green-600';
      case ERROR:
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

  get isExistingPlayer(): boolean {
    return this.repo.findPlayers()
      .some(p => p.code === this.editingPlayer.code);
  }

  get isValidPlayer(): boolean {
    return this.editingPlayer.code.length >= 2 &&
      this.editingPlayer.code.length <= 3;
  }

  get sections(): string[] {
    return ['Active', 'Inactive'];
  }
}
