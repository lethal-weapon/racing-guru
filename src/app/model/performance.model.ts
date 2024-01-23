export interface SeasonPerformance {
  season: string,
  races: number,
  hits: SeasonPerformanceHit[]
}

export interface SeasonPerformanceHit {
  topn: number,
  count: number,
  races: SeasonPerformanceHitRace[]
}

export interface SeasonPerformanceHitRace {
  meeting: string,
  race: number,
  odds: number
}

export interface NegativePerformance {
  meeting: string,
  race: number,
  starters: NegativePerformanceStarter[]
}

export interface NegativePerformanceStarter {
  reversedRank: number,
  jockey: string,
  trainer: string,
  placing: number,
  winOdds: number
}

export const DEFAULT_NEGATIVE_PERFORMANCE_STARTER: NegativePerformanceStarter = {
  reversedRank: 0,
  jockey: '',
  trainer: '',
  placing: 1,
  winOdds: 0
}
