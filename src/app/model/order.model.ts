export interface WinPlaceOdds {
  order : number,
  win   : number,
  place : number
}

export interface Singular {
  odds  : number,
  order : number
}

export interface Combination {
  odds   : number,
  orders : number[]
}