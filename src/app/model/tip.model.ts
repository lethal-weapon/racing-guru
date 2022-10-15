export class Tip {
  constructor(
    public source    : string,
    public tipster   : string,
    public orders    : number[],
    public confident : boolean
  ) {
  }
}