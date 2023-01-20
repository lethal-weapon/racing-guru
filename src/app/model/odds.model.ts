import {WinPlaceOdds, Combination} from './order.model';

export class Odds {
  constructor(
    public winPlace       : WinPlaceOdds[],
    public quinella       : Combination[],
    public forecast       : Combination[],
    public quinellaPlace ?: Combination[],
    // public trio           : Combination[],
    // public firstFour      : Combination[],
    // public double        ?: Combination[]
  ) {
  }
}