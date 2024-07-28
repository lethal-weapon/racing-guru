export interface Recommendation {
  meeting: string,
  venue: string,
  races: RaceRecommendation[]
}

export interface RaceRecommendation {
  race: number,
  postTime: string,
  computedAt: string
  starters: StarterChance[]
}

export interface StarterChance {
  order: number,
  chance: number,
  placings: StarterPlacingChance[]
}

export interface StarterPlacingChance {
  placing: number,
  chance: number
}
