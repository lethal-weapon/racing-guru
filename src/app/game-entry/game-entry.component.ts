import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-game-entry',
  templateUrl: './game-entry.component.html'
})
export class GameEntryComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }
}
