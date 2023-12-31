import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {ConnectionDividend, DEFAULT_CONNECTION_DIVIDEND} from '../../model/connection.model';
import {MAX_RACE_PER_MEETING} from '../../util/numbers';
import {formatOdds} from '../../util/functions';

@Component({
  selector: 'app-form-connection',
  templateUrl: './form-connection.component.html'
})
export class FormConnectionComponent implements OnInit {

  protected readonly formatOdds = formatOdds;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchConnectionDividends();
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  getConnectionDividend = (meeting: string, race: number): ConnectionDividend =>
    this.dividends.find(d => d.meeting === meeting && d.race === race) || DEFAULT_CONNECTION_DIVIDEND

  get meetings(): string[] {
    return this.dividends
      .map(d => d.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get dividends(): ConnectionDividend[] {
    return this.repo.findConnectionDividends();
  }
}