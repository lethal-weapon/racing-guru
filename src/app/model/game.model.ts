export interface GameSession {
  meeting: string,
  venue: string,
  range: string,
  races: number[],
  firstRacePostTime: string,
  entryFee: number,
  currentParticipants: number,
  minimumParticipants: number,
  stakeLevel: string,
  status: string,
}

export const CUTOFF_GAP_MINUTES: number = 5;
export const STAKE_LEVELS: string[] = ['Low Roller', 'Mid Roller', 'High Roller'];
export const SESSION_RANGES: string[] = ['1st Half', '2nd Half', 'Entire Meeting'];
