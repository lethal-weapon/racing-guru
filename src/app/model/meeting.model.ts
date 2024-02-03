export interface Meeting {
  meeting  : string,
  venue    : string,
  races    : number,
  turnover : number,
  persons  : PersonSummary[]
}

export interface PersonSummary {
  person      : string,
  wins        : number,
  seconds     : number,
  thirds      : number,
  fourths     : number,
  engagements : number,
  earnings    : number,
  starters    : EarningStarter[]
}

export interface EarningStarter {
  horse   : string,
  partner : string,
  race    : number,
  order   : number,
  placing : number,
  winOdds : number
  earning : number
}