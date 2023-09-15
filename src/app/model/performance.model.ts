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