export class Starter {
  constructor(
    public order       : number,
    public draw        : number,
    public horse       : string,
    public jockey      : string,
    public trainer     : string,
    public horseNameEN : string,
    public horseNameCH : string
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