export class Tip {
  constructor(
    public source    : string,
    public tipster   : string,
    public tip       : number[],
    public confident : boolean
  ) {
  }
}