export interface PastStarter {
  meeting  : string,
  venue    : string,
  track    : string,
  grade    : string,
  distance : number,
  duration : string,
  jockey   : string,
  trainer  : string,
  placing  : number,
  winOdds  : number
}

export class Horse {
  constructor(
    public code          : string,
    public nameEN        : string,
    public nameCH        : string,
    public ownerCH       : string,
    public origin        : string,
    public age           : number,
    public total1st      : number,
    public total2nd      : number,
    public total3rd      : number,
    public totalRuns     : number,
    public retired       : boolean,
    public retiredAt     : string,
    public targetMeeting : string,
    public pastStarters  : PastStarter[]
  ) {
  }
}

export const DEFAULT_HORSE : Horse = {
  code          : 'TBD',
  nameEN        : 'TBD',
  nameCH        : 'TBD',
  ownerCH       : 'TBD',
  origin        : 'TBD',
  age           : 1,
  total1st      : 0,
  total2nd      : 0,
  total3rd      : 0,
  totalRuns     : 0,
  retired       : false,
  retiredAt     : '2000-01-01',
  targetMeeting : '2000-01-01',
  pastStarters: []
}