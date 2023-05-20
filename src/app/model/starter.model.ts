export class Starter {
  constructor(
    public order      : number,
    public draw       : number,
    public horse      : string,
    public jockey     : string,
    public trainer    : string,
    public scratched  : boolean,
    public placing   ?: number,
    public winOdds   ?: number
  ) {
  }
}