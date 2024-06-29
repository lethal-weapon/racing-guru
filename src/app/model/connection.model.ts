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
