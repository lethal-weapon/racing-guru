export class Pool {
  constructor(
    public win            : number,
    public place          : number,
    public quinella       : number,
    public quinellaPlace  : number,
    public forecast       : number,
    public tierce         : number,
    public trio           : number,
    public firstFour      : number,
    public quartet        : number,
    public double        ?: number
  ) {
  }
}

export interface FinalPool {
  meeting  : string,
  race     : number,
  time     : string,
  venue    : string,
  grade    : string,
  starters : number,
  WIN      : number,
  PLA      : number,
  QIN      : number,
  QPL      : number,
  FT       : number,
  FQ       : number,
  TCE      : number,
  DBL      : number
}

export const DEFAULT_FINAL_POOL: FinalPool = {
  meeting  : '1999-09-09',
  race     : 9,
  time     : '18:45',
  venue    : 'HV',
  grade    : '-',
  starters : 0,
  WIN      : 0,
  PLA      : 0,
  QIN      : 0,
  QPL      : 0,
  FT       : 0,
  FQ       : 0,
  TCE      : 0,
  DBL      : 0
}