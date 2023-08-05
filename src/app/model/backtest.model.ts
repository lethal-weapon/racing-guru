export interface FactorHit {
  factors   : string[],
  hits      : FactorHitPlacing[]
  totalHits : number
}

export interface FactorHitPlacing {
  topn     : number,
  hitRaces : number
  betRaces : number
}

export interface EngineYield {
  name    : string
  factors : string[]
  yields  : TesterYield[]
}

export interface TesterYield {
  version     : string,
  description : string,
  debit       : number,
  credit      : number,
  meetings    : MeetingYield[]
}

export interface MeetingYield {
  meeting : string,
  debit   : number,
  credit  : number,
  races   : RaceYield[]
}

export interface RaceYield {
  race     : number,
  debit    : number,
  credit   : number,
  betlines : BetlineYield[]
}

export interface BetlineYield {
  betline : string,
  debit   : number,
  credit  : number
}