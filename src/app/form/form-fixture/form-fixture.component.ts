import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';

@Component({
  selector: 'app-form-fixture',
  templateUrl: './form-fixture.component.html'
})
export class FormFixtureComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }
}
