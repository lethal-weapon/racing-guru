import {Starter} from './starter.model';

export interface Signal {
  win: SingularSignal[],
  place: SingularSignal[],
  quinella: CombinationSignal[],
  quinellaPlace: CombinationSignal[],
  forecast: CombinationSignal[],
  trio: CombinationSignal[],
  firstFour: CombinationSignal[],
  doubles: CombinationSignal[],
  jkc: SingularSignal[],
  tnc: SingularSignal[]
}

export interface SingularSignal {
  order: number,
  currentOdds: number,
  previousOdds: number,
  detectedAt: string
}

export interface CombinationSignal {
  orders: number[],
  currentOdds: number,
  previousOdds: number,
  detectedAt: string
}

export interface SignalSnapshot {
  meeting: string,
  venue: string,
  races: RaceSignalSnapshot[]
}

export interface RaceSignalSnapshot {
  race: number,
  time: string,
  signal: Signal,
  starters: Starter[]
}
