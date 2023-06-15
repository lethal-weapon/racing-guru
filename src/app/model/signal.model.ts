export interface SingularSignal {
  order        : number,
  currentOdds  : number,
  previousOdds : number,
  detectedAt   : string
}

export interface CombinationSignal {
  orders       : number[],
  currentOdds  : number,
  previousOdds : number,
  detectedAt   : string
}

export class Signal {
  constructor(
    public win           ?: SingularSignal[],
    public place         ?: SingularSignal[],
    public quinella      ?: CombinationSignal[],
    public quinellaPlace ?: CombinationSignal[],
    public forecast      ?: CombinationSignal[],
    public trio          ?: CombinationSignal[],
    public firstFour     ?: CombinationSignal[],
    public double        ?: CombinationSignal[]
  ) {
  }
}