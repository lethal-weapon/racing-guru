export class Betline {
  constructor(
    public command  : string,
    public credit   : number,
    public debit    : number,
    public race    ?: number
  ) {
  }
}

export class Record {
  constructor(
    public meeting    : string,
    public venue      : string,
    public account    : string,
    public fund       : number,
    public deposit    : number,
    public withdrawal : number,
    public balance    : number,
    public debit      : number,
    public credit     : number,
    public betlines   : Betline[]
  ) {
  }
}