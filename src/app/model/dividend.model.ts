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

export const DEFAULT_SINGULARS: Singular[] = [{order: 0, odds: 0}]
export const DEFAULT_COMBINATIONS: Combination[] = [
  {orders: [0, 0, 0, 0], odds: 0},
  {orders: [0, 0, 0, 0], odds: 0},
  {orders: [0, 0, 0, 0], odds: 0},
  {orders: [0, 0, 0, 0], odds: 0},
]
