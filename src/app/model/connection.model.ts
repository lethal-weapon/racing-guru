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

export interface DividendStarter {
  order: number,
  draw: number,
  placing: number,
  odds: number,
  jockey: string,
  trainer: string
}

export interface ConnectionDividend {
  meeting: string,
  race: number,
  starters: DividendStarter[],
  distantPairs: number[][]
}
