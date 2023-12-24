export interface DrawBiasScore {
  draw: number,
  starters: number,
  score: number,
  ratedScore: number
}

export interface TrackBiasScore {
  meeting: string,
  race: number,
  venue: string,
  track: string,
  course: string,
  distance: number,
  races: number,
  draws: DrawBiasScore[]
}

export const DEFAULT_DRAW_BIAS_SCORE: DrawBiasScore = {
  draw: 0,
  starters: 0,
  score: 0,
  ratedScore: 0
}

export const DEFAULT_TRACK_BIAS_SCORE: TrackBiasScore = {
  meeting: '',
  race: 0,
  venue: '',
  track: '',
  course: '',
  distance: 0,
  races: 0,
  draws: []
}