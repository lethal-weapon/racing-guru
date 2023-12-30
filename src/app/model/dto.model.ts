export interface FavoritePost {
  meeting: string,
  race: number,
  favorites: number[]
}

export interface Interview {
  meeting: string,
  race: number,
  order: number,
  interviewee: string
}

export interface Selection {
  order: number,
  placing: number
}

export interface SelectionPost {
  meeting: string,
  race: number,
  selections: Selection[]
}

export interface DividendDto {
  meeting: string,
  race: number,
  win: number,
  quinella: number,
  forecast: number,
  tierce: number,
  quartet: number
}

export const DEFAULT_DIVIDEND: DividendDto = {
  meeting: '',
  race: 0,
  win: 0,
  quinella: 0,
  forecast: 0,
  tierce: 0,
  quartet: 0
}

export interface DrawPlacingPerformance {
  draw: number,
  placing: number,
  inherit: boolean
}

export interface DrawPerformance {
  meeting: string,
  race: number,
  venue: string,
  inheritance: number,
  draws: DrawPlacingPerformance[]
}