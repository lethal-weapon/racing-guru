import {Singular, Combination} from './odds.model';

export class Dividend {
  constructor(
    public win           ?: Singular[],
    public place         ?: Singular[],
    public quinella      ?: Combination[],
    public quinellaPlace ?: Combination[],
    public forecast      ?: Combination[],
    public tierce        ?: Combination[],
    public trio          ?: Combination[],
    public firstFour     ?: Combination[],
    public quartet       ?: Combination[],
    public double        ?: Combination[]
  ) {
  }
}

export interface DividendPool {
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