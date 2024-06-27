export interface Odds {
  winPlace: WinPlaceOdds[],
  quinella: Combination[],
  quinellaPlace: Combination[],
  forecast: Combination[],
  trio: Combination[],
  firstFour: Combination[],
  doubles: Combination[],
  tierce: TierceInvestment[],
  jkc: ChallengeOdds[],
  tnc: ChallengeOdds[]
}

export interface Singular {
  order: number,
  odds: number
}

export interface Combination {
  orders: number[],
  odds: number
}

export interface CrossRaceCombination {
  orders: number[][],
  odds: number
}

export interface WinPlaceOdds {
  order: number,
  win: number,
  place: number
}

export interface TierceInvestment {
  order: number,
  win: number,
  second: number,
  third: number
}

export interface ChallengeOdds {
  order: number,
  odds: number,
  challenger: string,
  outsider: boolean,
  starters: number,
  points: number
}

export const DEFAULT_CHALLENGE_ODDS: ChallengeOdds = {
  order: 0,
  odds: 0,
  challenger: '',
  outsider: false,
  starters: 0,
  points: 0
}
