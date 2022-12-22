import {Component, OnInit} from '@angular/core';

import {RaceHorse} from '../model/racehorse.model';
import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-matcher',
  templateUrl: './matcher.component.html'
})
export class MatcherComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

}