export interface Collaboration {
  jockey   : string,
  trainer  : string,
  total    : number,
  wins     : number,
  seconds  : number,
  thirds   : number,
  fourths  : number,
  starters : CollaborationStarter[]
}

export interface CollaborationStarter {
  meeting      : string,
  race         : number,
  horse        : string,
  horseNameCH  : string,
  placing     ?: number,
  winOdds     ?: number
}

export const DEFAULT_COLLABORATION : Collaboration = {
  jockey   : '',
  trainer  : '',
  total    : 0,
  wins     : 0,
  seconds  : 0,
  thirds   : 0,
  fourths  : 0,
  starters : []
}