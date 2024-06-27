export interface TrackworkSnapshot {
  meeting: string,
  venue: string,
  starters: TrackworkStarter[]
}

export interface TrackworkStarter {
  race: number,
  order: number,
  draw: number,
  placing: number,
  winOdds: number,
  horse: string,
  horseNameCH: string,
  jockey: string,
  trainer: string,
  scratched: boolean,
  trainerFocus: boolean,
  intensity: number,
  grade: string
}
