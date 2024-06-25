export interface DrawPlacingPerformance {
  draw: number,
  placing: number,
  inherit: boolean
}

export interface DrawInheritance {
  meeting: string,
  venue: string,
  race: number,
  inheritance: number,
  draws: DrawPlacingPerformance[]
}
