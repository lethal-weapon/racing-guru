import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-backtest-exact',
  templateUrl: './backtest-exact.component.html'
})
export class BacktestExactComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }
}
