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