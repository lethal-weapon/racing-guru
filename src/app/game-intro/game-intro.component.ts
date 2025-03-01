import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {ODDS_INTENSITIES, PLACING_MAPS} from '../util/strings';

@Component({
  selector: 'app-game-intro',
  templateUrl: './game-intro.component.html'
})
export class GameIntroComponent implements OnInit {

  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly ODDS_INTENSITIES = ODDS_INTENSITIES;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  get rewards(): Array<{ item: string, percentage: number }> {
    return [
      {item: 'Winner', percentage: 50},
      {item: 'Second', percentage: 25},
      {item: 'Third', percentage: 10},
      {item: 'Forth', percentage: 5},
      {item: 'Service Charge', percentage: 10},
    ]
  }

  get rewardSpecs(): string[] {
    return [
      `
        A percentage of the pot will be distributed to the top 4 
        participants with the highest points within a game session.
      `,
      `Dead-heat case will be considered when one or more ties occur.`,
      `A service charge will be imposed for each game session.`,
    ]
  }

  get pointTableSpecs(): string[] {
    return [
      `Each selection's score is calculated individually.`,
      `A selection scores NO points if finishes in 5th or later placing.`,
      `
        A default of 4 points will be credited if a selected
        starter is later scratched after the submission.
      `,
    ]
  }

  get rules(): string[] {
    return [
      `A user can only join game session after he unlocks the race meeting.`,
      `A user can join up to 3 game sessions within the same race meeting.`,
      `
        A game session entry will close 5 minutes prior to
        the scheduled post time of the 1st race it involves.
      `,
      `
        A game session will be cancelled and all golds will be refunded
        if participants are less than the minimum requirement.
      `,
      `
        Each game participant needs to submit his top 4 selection
        orders before the scheduled post time of the corresponding race.
      `,
      `
        Each game participant can see if other participants have submitted
        their selections but cannot see what exactly their selections are.
      `,
      `
        The selection cannot be altered once submitted.
      `,
      `
        Each selected order will acquire a score which is measured by
        the final win odds intensity and the placing, please refer to Point Table.
      `,
      `
        By the end of each race, participants within a game 
        session are re-ranked by the points they have scored so far.
      `,
      `
        By the end of each race, all participants' selections are published.
      `,
      `
        By the end of a game session, participants are ranked by the 
        total points they have scored in this session. 
      `,
      `
        The session rewards will be distributed within 1 working day.
      `,
    ]
  }
}
