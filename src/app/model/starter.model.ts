export class Rating {
  constructor(
    public factor : string,
    public grade  : string,
    public score  : number
  ) {
  }
}

export class Starter {
  constructor(
    public order        : number,
    public draw         : number,
    public horse        : string,
    public jockey       : string,
    public trainer      : string,
    public ratings      : Rating[],
    public scratched    : boolean,
    public interviewed  : boolean,
    public interviewee ?: string,
    public chance      ?: number,
    public placing     ?: number,
    public winOdds     ?: number
  ) {
  }
}