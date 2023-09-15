export interface Singular {
  order : number,
  odds  : number
}

export interface Combination {
  orders : number[],
  odds   : number
}

export interface WinPlaceOdds {
  order : number,
  win   : number,
  place : number
}

export interface ChallengeOdds {
  order      : number,
  challenger : string,
  outsider   : boolean,
  starters   : number,
  points     : number,
  odds       : number
}

export const DEFAULT_CHALLENGE_ODDS : ChallengeOdds = {
  order      : 0,
  challenger : '',
  outsider   : false,
  starters   : 0,
  points     : 0,
  odds       : 0
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
    public tierce        ?: TierceInvestment[],
    public firstFour     ?: Combination[],
    public quinellaPlace ?: Combination[],
    public double        ?: Combination[],
    public jkc           ?: ChallengeOdds[],
    public tnc           ?: ChallengeOdds[]
  ) {
  }
}