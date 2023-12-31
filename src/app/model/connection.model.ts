export interface Pair {
  personA: string,
  personB: string
}

export interface Connection {
  orders: number[],
  pairs: Pair[]
}

export interface RaceConnection {
  meeting: string,
  race: number,
  connections: Connection[]
}

export interface ConnectionDividendOdds {
  odds: number,
  connected: boolean
}

export interface ConnectionDividend {
  meeting: string,
  race: number,
  quinella: ConnectionDividendOdds,
  quinellaPlace: ConnectionDividendOdds[]
}

export const DEFAULT_CONNECTION_DIVIDEND: ConnectionDividend = {
  meeting: '',
  race: 0,
  quinella: {odds: 0, connected: false},
  quinellaPlace: []
}