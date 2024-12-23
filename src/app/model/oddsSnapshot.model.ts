import {WinPlaceOdds} from './odds.model';

export interface OddsSnapshot {
  meeting: string,
  race: number,
  venue: string,
  time: string,
  distributions: StarterDistribution[],
  cashflows: StarterCashflow[]
}

export interface StarterDistribution {
  timestamp: string,
  winPlaceOdds: WinPlaceOdds[],
  investments: StarterInvestment[]
}

export interface StarterCashflow {
  fromTimestamp: string,
  toTimestamp: string,
  investments: StarterInvestment[]
}

export interface StarterInvestment {
  order: number,
  win: number,
  place: number,
  quinella: number,
  quinellaPlace: number,
  forecast: number,
  trio: number,
  tierce: number,
  firstFour: number,
  quartet: number,
  doubles: number,
  total: number
}
