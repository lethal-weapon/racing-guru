import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';

@Component({
  selector: 'app-form-connection',
  templateUrl: './form-connection.component.html'
})
export class FormConnectionComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  get isLoading(): boolean {
    return false;
  }
}
