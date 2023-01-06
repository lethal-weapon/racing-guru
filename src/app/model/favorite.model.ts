export class Favorite {
  constructor(
    public bankers    : number[],
    public selections : number[]
  ) {
  }
}

export interface FavoritePost {
  meeting    : string,
  race       : number,
  bankers    : number[],
  selections : number[]
}