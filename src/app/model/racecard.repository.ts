import {Injectable} from '@angular/core';

import {RestDataSource} from './rest.datasource';
import {Racecard} from './racecard.model';

@Injectable()
export class RacecardRepository {
  private racecards: Racecard[] = [];

  constructor(private source: RestDataSource) {
    source.getRacecards().subscribe(data => this.racecards = data);
  }

  findAll(): Racecard[] {
    return this.racecards
      .sort((r1, r2) => r1.race - r2.race);
  }

}