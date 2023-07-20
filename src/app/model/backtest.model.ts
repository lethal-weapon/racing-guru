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