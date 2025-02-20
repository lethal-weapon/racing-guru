import {Combination, CrossRaceCombination, Singular} from './odds.model';

export interface Dividend {
  win: Singular[],
  place: Singular[],
  quinella: Combination[],
  quinellaPlace: Combination[],
  forecast: Combination[],
  trio: Combination[],
  tierce: Combination[],
  firstFour: Combination[],
  quartet: Combination[],
  doubles: CrossRaceCombination[],
  treble: CrossRaceCombination[],
  sixUp: CrossRaceCombination[],
  doubleTrio: CrossRaceCombination[],
  tripleTrio: CrossRaceCombination[]
}

export interface PoolThreshold {
  name: string,
  threshold: number
}

export const DEFAULT_SINGULARS: Singular[] = [{order: 0, odds: 0}]
export const DEFAULT_COMBINATIONS: Combination[] = [
  {orders: [0, 0, 0, 0], odds: 0},
  {orders: [0, 0, 0, 0], odds: 0},
  {orders: [0, 0, 0, 0], odds: 0},
  {orders: [0, 0, 0, 0], odds: 0},
]

export const DIVIDEND_CROSS_RACE_POOLS: PoolThreshold[] = [
  {name: 'TBL-1', threshold: 100},
  {name: 'TBL-2', threshold: 40},
  {name: '6UP-1', threshold: 300},
  {name: '6UP-2', threshold: 3000},
  {name: 'D-T', threshold: 3000},
  {name: 'TT-1', threshold: 10000},
  {name: 'TT-2', threshold: 1000},
]

export const DIVIDEND_RACE_POOLS: PoolThreshold[] = [
  {name: 'WIN', threshold: 8},
  {name: 'QIN', threshold: 40},
  {name: 'FCT', threshold: 80},
  {name: 'TRI', threshold: 100},
  {name: 'F-F', threshold: 100},
  {name: 'TCE', threshold: 300},
  {name: 'QTT', threshold: 3000},
  {name: 'PLA-1', threshold: 4},
  {name: 'PLA-2', threshold: 4},
  {name: 'PLA-3', threshold: 4},
  {name: 'QPL-1', threshold: 15},
  {name: 'QPL-2', threshold: 15},
  {name: 'QPL-3', threshold: 15},
  {name: 'DBL-1', threshold: 50},
  {name: 'DBL-2', threshold: 20},
]

