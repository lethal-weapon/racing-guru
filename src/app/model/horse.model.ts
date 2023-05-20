export interface PastStarter {
  meeting : string,
  venue   : string,
  jockey  : string,
  trainer : string,
  placing : number,
  winOdds : number
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
    public targetMeeting : string,
    public pastStarters  : PastStarter[]
  ) {
  }
}