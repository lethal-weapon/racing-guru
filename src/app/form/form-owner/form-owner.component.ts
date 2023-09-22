import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Horse} from '../../model/horse.model';

@Component({
  selector: 'app-form-owner',
  templateUrl: './form-owner.component.html'
})
export class FormOwnerComponent implements OnInit {

  activeSyndicate: string = '';
  selectedHorses: string[] = [];

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchHorses();
  }

  isSelectedHorse = (code: string) =>
    this.selectedHorses.includes(code)

  unsetHorses = () =>
    this.selectedHorses = []

  toggleHorse = (code: string) => {
    if (this.isSelectedHorse(code)) {
      this.selectedHorses = this.selectedHorses.filter(s => s !== code);
      return;
    }
    this.selectedHorses.push(code);
  }

  saveSyndicate = () => {

  }

  addSyndicate = () => {

  }

  deleteSyndicate = () => {

  }

  get controlButtonStyle(): string {
    return `
      px-2 pt-1.5 pb-2 text-lg rounded-lg hvr-grow-shadow
      cursor-pointer border border-gray-600 hover:border-yellow-400
    `
  }

  get horses(): Horse[] {
    return this.repo.findHorses().slice(0, 12);
  }
}