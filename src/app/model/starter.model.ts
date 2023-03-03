export class Starter {
  constructor(
    public order          : number,
    public draw           : number,
    public horse          : string,
    public jockey         : string,
    public trainer        : string,
    public horseNameEN    : string,
    public horseNameCH    : string,
    public ownerCH        : string,
    public origin         : string,
    public age            : number,
    public horseTotal1st  : number,
    public horseTotal2nd  : number,
    public horseTotal3rd  : number,
    public horseTotalRuns : number,
    public bonusRun       : boolean
  ) {
  }
}

export interface PastStarter {
  horse   : string,
  jockey  : string,
  trainer : string,
  meeting : string,
  venue   : string,
  placing : number,
  winOdds : number
}