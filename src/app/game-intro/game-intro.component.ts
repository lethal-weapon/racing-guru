import {Component, OnInit} from '@angular/core';

import {ODDS_INTENSITIES, PLACING_MAPS} from '../util/strings';

@Component({
  selector: 'app-game-intro',
  templateUrl: './game-intro.component.html'
})
export class GameIntroComponent implements OnInit {

  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly ODDS_INTENSITIES = ODDS_INTENSITIES;

  constructor() {
  }

  ngOnInit(): void {
  }

  get rewards():
    Array<{ item: string, percentage: number, golds: number, goldsRounded: number }> {

    return [
      {item: 'Winner', percentage: 50, golds: 283.5, goldsRounded: 284},
      {item: 'Second', percentage: 25, golds: 141.7, goldsRounded: 142},
      {item: 'Third', percentage: 10, golds: 56.7, goldsRounded: 57},
      {item: 'Forth', percentage: 5, golds: 27.8, goldsRounded: 28},
      {item: 'Service Charge', percentage: 10, golds: 56.7, goldsRounded: 56},
    ]
  }

  get pointTableSpecs(): string[] {
    return [
      `Each selection's score is calculated individually.`,
      `The selections like [5, 6, 7, 8] is same as [7, 5, 8, 6].`,
      `A selection scores NO points if finishes in 5th or later placing.`,
      `
        A default of 4 points will be credited if a selected
        starter is later scratched after the submission.
      `,
      `
        A race result of [5W @3.5, 6Q @9.3, 7P @18, 8F @26]
        will have points of [4pt, 6pt, 6pt, 4pt], 20 points in total at max.
      `,
      `
        For the race result example above, the selections of [1, 2, 5, 8]
        will score 8 points, [2, 6, 7, 9] will score 12 points.
      `,
    ]
  }

  get rewardSpecs(): string[] {
    return [
      `
        The pot consists of all entry fees collected from participants
        and an optional jackpot by the company from time to time.
      `,
      `
        A percentage of the pot will be distributed to the top 4 
        participants with the highest points within a game session.
      `,
      `Dead-heat case will be considered when one or more ties occur.`,
      `A service charge will be imposed for each game session.`,
      `Service charge is computed at last after all participant rewards are computed.`,
      `
        Rounding Precision e.g.
        17.0 ~ 17.4 golds will be rounded to 17 golds,
        17.5 ~ 17.9 golds will be rounded to 18 golds.
      `,
      `If the pot has 567 golds in total, then it will pay out as below:`
    ]
  }

  get rules(): string[] {
    return [
      `A user can only join game session after he unlocks the race meeting.`,
      `A user can join up to 3 game sessions within the same race meeting.`,
      `
        A game session entry will close and session start 5 minutes
        prior to the scheduled post time of the 1st race it involves.
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
        the final win odds intensity and the placing, see Point Table.
      `,
      `
        By the end of each race, participants within a game 
        session are re-ranked by the points they have scored so far.
      `,
      `
        By the end of each race, all participants'
        selections in this race are published.
      `,
      `
        By the end of a game session, participants are ranked by the 
        total points they have scored in this session. 
      `,
      `
        The session rewards will be distributed after 1 working day.
      `,
    ]
  }
}
