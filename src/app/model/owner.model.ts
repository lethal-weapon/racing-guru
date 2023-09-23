export class HorseOwner {
  constructor(
    public members : string[],
    public horses  : string[]
  ) {
  }
}

export class Syndicate {
  constructor(
    public id      : number,
    public members : string[],
    public horses  : string[]
  ) {
  }
}