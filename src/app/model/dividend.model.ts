import {Singular, Combination} from './order.model';

export class Dividend {
  constructor(
    public win           ?: Singular[],
    public place         ?: Singular[],
    public quinella      ?: Combination[],
    public quinellaPlace ?: Combination[],
    public forecast      ?: Combination[],
    public tierce        ?: Combination[],
    public trio          ?: Combination[],
    public firstFour     ?: Combination[],
    public quartet       ?: Combination[],
    public double        ?: Combination[]
  ) {
  }
}

export interface FinalDividend {
  meeting : string,
  race    : number,
  venue   : string,
  WIN     : number,
  QIN     : number,
  TCE     : number,
  QTT     : number,
  persons : PersonPlacing[]
}

interface PersonPlacing {
  person  : string,
  placing : number
}