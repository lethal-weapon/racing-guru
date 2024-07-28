export interface Factor {
  order: number,
  name: string,
  description: string,
  general: boolean,
  negative: boolean
}

export interface FactorHit {
  factors: string[],
  totalHits: number,
  hits: FactorHitPlacing[],
  defaultYields: TesterYield[],
  enhancedYields: TesterYield[]
}

export interface FactorHitPlacing {
  topn: number,
  hitRaces: number,
  betRaces: number
}

export interface TesterYield {
  version: string,
  description: string,
  debit: number,
  credit: number,
  meetings: MeetingYield[]
}

export interface MeetingYield {
  meeting: string,
  debit: number,
  credit: number,
  races: RaceYield[]
}

export interface RaceYield {
  race: number,
  debit: number,
  credit: number,
  betlines: BetlineYield[]
}

export interface BetlineYield {
  betline: string,
  debit: number,
  credit: number
}
