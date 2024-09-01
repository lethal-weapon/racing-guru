import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-finance-accounting',
  templateUrl: './finance-accounting.component.html'
})
export class FinanceAccountingComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }
}
