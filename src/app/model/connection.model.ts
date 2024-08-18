export interface PlayerConnectionRequest {
  playerA: string,
  playerB: string,
  relation: string,
  active: boolean
}

export interface PlayerConnection {
  playerA: string,
  playerB: string,
  relations: string[]
}

export interface BlacklistConnection {
  meeting: string,
  venue: string,
  race: number,
  orders: number[][]
}
