export interface Horse {
  code: string,
  nameEN: string,
  nameCH: string,
  ownerCH: string,
  origin: string,
  sex: string,
  age: number,
  colors: string[],
  total1st: number,
  total2nd: number,
  total3rd: number,
  totalRuns: number,
  retired: boolean,
  retiredAt: string,
  pastStarters: PastStarter[]
}

export interface PastStarter {
  meeting: string,
  venue: string,
  track: string,
  grade: string,
  distance: number,
  duration: string,
  jockey: string,
  trainer: string,
  placing: number,
  winOdds: number
}

export const DEFAULT_HORSE: Horse = {
  code: 'TBD',
  nameEN: 'TBD',
  nameCH: 'TBD',
  ownerCH: 'TBD',
  origin: 'TBD',
  sex: 'TBD',
  age: 1,
  colors: [],
  total1st: 0,
  total2nd: 0,
  total3rd: 0,
  totalRuns: 0,
  retired: false,
  retiredAt: '2030-01-01',
  pastStarters: []
}
