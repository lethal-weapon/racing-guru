export interface Recommendation {
  meeting: string,
  venue: string,
  races: RaceRecommendation[]
}

export interface RaceRecommendation {
  race: number,
  postTime: string,
  computedAt: string,
  starters: StarterRank[],
  bets: BetRecommendation[]
}

export interface StarterRank {
  order: number,
  rank: number,
  placings: StarterPlacingRank[]
}

export interface StarterPlacingRank {
  placing: number,
  rank: number
}

export interface BetRecommendation {
  betline: string,
  combinations: number
}

export const DEFAULT_RECOMMENDATION: Recommendation = {
  meeting: '',
  venue: '',
  races: []
}
