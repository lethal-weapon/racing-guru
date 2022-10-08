export interface Combination {
  combination: number[],
  odds: number
}

export class Dividend {
  constructor(
    public win           : {},
    public place         : {},
    public quinella      : Combination[],
    public quinellaPlace : Combination[],
    public forecast      : Combination[],
    public tierce        : Combination[],
    public trio          : Combination[],
    public firstFour     : Combination[],
    public quartet       : Combination[]
  ) {
  }
}