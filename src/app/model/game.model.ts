export interface GameSession {
  meeting: string,
  venue: string,
  range: string,
  races: number[],
  firstRacePostTime: string,
  entryCutoffTime: string,
  entryFee: number,
  currentParticipants: number,
  minimumParticipants: number,
  stakeLevel: string,
  status: string,
}
