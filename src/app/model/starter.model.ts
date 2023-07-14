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
    public order      : number,
    public draw       : number,
    public horse      : string,
    public jockey     : string,
    public trainer    : string,
    public scratched  : boolean,
    public ratings    : Rating[],
    public placing   ?: number,
    public winOdds   ?: number
  ) {
  }
}