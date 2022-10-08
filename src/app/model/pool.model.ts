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