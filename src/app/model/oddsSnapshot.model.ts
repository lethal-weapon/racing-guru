import {Pool} from './pool.model';
import {Odds} from './odds.model';

export interface OddsSnapshot {
  meeting: string,
  race: number,
  venue: string,
  time: string,
  snapshots: PoolOddsSnapshot[],
  cashflows: StarterCashflow[]
}

export interface PoolOddsSnapshot {
  timestamp: string,
  pool: Pool,
  odds: Odds,
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
