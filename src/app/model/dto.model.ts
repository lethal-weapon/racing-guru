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
