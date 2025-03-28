export interface GameReward {
  item: string
  percentage: number
  golds: number
  goldsRounded: number
}

export const GAME_REWARDS: GameReward[] = [
  {item: 'Winner', percentage: 50, golds: 283.5, goldsRounded: 284},
  {item: 'Second', percentage: 25, golds: 141.7, goldsRounded: 142},
  {item: 'Third', percentage: 10, golds: 56.7, goldsRounded: 57},
  {item: 'Forth', percentage: 5, golds: 27.8, goldsRounded: 28},
  {item: 'Service Charge', percentage: 10, golds: 56.7, goldsRounded: 56},
]

export const GAME_REWARD_SPECS: string[] = [
  `
    The session pot consists of all entry fees collected from participants<br>
    and an optional jackpot by the company from time to time.
  `,
  `
    A percentage of the pot will be distributed to the top 4<br>
    participants with the highest points within a game session.
  `,
  `
    Dead-heat case will be considered when one or more ties occur.
  `,
  `
    A service charge will be imposed for each game session.
  `,
  `
    Service charge is computed at last after all participant rewards are computed.
  `,
  `
    The optional jackpot is different from the one defined by HKJC,<br>
    it still subjects to the service charge for ease of reward calculation.
  `,
  `
    Rounding Precision e.g.<br>
    17.0 ~ 17.4 golds will be rounded to 17 golds,<br>
    17.5 ~ 17.9 golds will be rounded to 18 golds.
  `,
  `
    If the pot has 567 golds in total, then it will pay out as below:
  `
]

export const GAME_RULE_SPECS: string[] = [
  `
    A user can only join game session after he unlocks the race meeting.
  `,
  `
    A user can join up to 3 game sessions within the same race meeting.
  `,
  `
    A game session entry will close and session starts 5 minutes<br>
    prior to the scheduled post time of the 1st race it involves.
  `,
  `
    A game session will be cancelled and all entry fees will be refunded<br>
    if participants are less than the minimum requirement.
  `,
  `
    Each game participant needs to submit his top 4 selections<br>
    before the scheduled post time of the corresponding race.
  `,
  `
    Each game participant can see if other participants have submitted<br>
    their selections but cannot see what exactly their selections are.
  `,
  `
    The selection cannot be altered once submitted.
  `,
  `
    Each selected order will score a certain point which is measured by<br>
    the final win odds intensity and the placing, see Point Table.
  `,
  `
    By the end of each race, participants within a game<br>
    session are re-ranked by the points they have scored so far.
  `,
  `
    By the end of each race, all participants' selections in this race are published.
  `,
  `
    By the end of a game session, participants are ranked by the<br>
    total points they have scored in this session. 
  `,
  `
    The session rewards will be distributed after 1 working day.
  `,
]

export const GAME_POINT_TABLE_SPECS: string[] = [
  `
    Each selection's score is calculated individually.
  `,
  `
    The selections like [5, 6, 7, 8] are same as [7, 5, 8, 6].
  `,
  `
    A selection scores NO points if the starter finishes in 5th or later placing.
  `,
  `
    A default of 4 points will be credited if a selected<br>
    starter is later scratched after the submission.
  `,
  `
    A race result of [5W @3.5, 6Q @9.3, 7P @18, 8F @26]<br>
    will have points of [4pt, 6pt, 6pt, 4pt], 20 points in total at max.
  `,
  `
    For the race result example above,<br>
    the selections of [1, 2, 5, 8] will score 8 points,<br>
    the selections of [2, 6, 7, 9] will score 12 points.
  `,
]
