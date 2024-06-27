export interface Meeting {
  meeting: string,
  venue: string,
  races: number,
  turnover: number,
  players: PlayerSummary[]
}

export interface PlayerSummary {
  player: string,
  wins: number,
  seconds: number,
  thirds: number,
  fourths: number,
  engagements: number,
  earnings: number,
  starters: EarningStarter[]
}

export interface EarningStarter {
  race: number,
  order: number,
  draw: number,
  placing: number,
  winOdds: number,
  earning: number,
  partner: string,
  horse: string,
  horseNameCH: string,
  scratched: boolean
}
