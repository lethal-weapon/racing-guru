export class Syndicate {
  constructor(
    public id      : number,
    public members : string[],
    public horses  : string[]
  ) {
  }
}

export interface SyndicatePerformance {
  meeting  : string,
  race     : number,
  single   : string,
  multiple : string,
  others   : string
}
