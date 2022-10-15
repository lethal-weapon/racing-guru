import {Singular, Combination} from './order.model';

export class Odds {
  constructor(
    public win            : Singular[],
    public place          : Singular[],
    public quinella       : Combination[],
    public quinellaPlace  : Combination[],
    public forecast       : Combination[],
    public trio           : Combination[],
    public firstFour      : Combination[],
    public double        ?: Combination[]
  ) {
  }
}