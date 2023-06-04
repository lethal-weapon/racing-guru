export interface Singular {
  odds  : number,
  order : number
}

export interface Combination {
  odds   : number,
  orders : number[]
}

export interface WinPlaceOdds {
  order : number,
  win   : number,
  place : number
}

export interface TierceInvestment {
  order  : number,
  win    : number,
  second : number,
  third  : number
}

export class Odds {
  constructor(
    public winPlace       : WinPlaceOdds[],
    public quinella       : Combination[],
    public forecast       : Combination[],
    public trio           : Combination[],
    public tierce         : TierceInvestment[],
    public firstFour     ?: Combination[],
    public quinellaPlace ?: Combination[],
    public double        ?: Combination[]
  ) {
  }
}