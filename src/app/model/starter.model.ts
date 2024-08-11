export interface Starter {
  order: number,
  draw: number,
  placing: number,
  winOdds: number,
  horse: string,
  jockey: string,
  trainer: string,
  scratched: boolean,
  interviewed: boolean,
  interviewee: string
}

export interface StarterChange {
  order: number,
  scratched: boolean,
  previousHorse: string,
  previousJockey: string,
  previousTrainer: string,
  currentHorse: string,
  currentJockey: string,
  currentTrainer: string,
  race: number
}
