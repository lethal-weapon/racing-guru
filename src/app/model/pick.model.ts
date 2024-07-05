export interface Pick {
  meeting: string,
  races: RacePick[]
}

export interface RacePick {
  race: number,
  favorites: number[],
  selections: Selection[]
}

export interface Selection {
  order: number,
  placing: number
}

export const DEFAULT_PICK: Pick = {
  meeting: '',
  races: []
}
