export interface Report {
  meeting: string,
  fines: Fine[],
  withdrawals: Withdrawal[],
  suspensions: Suspension[]
}

export interface Fine {
  race: number,
  horse: string,
  player: string,
  amount: number,
  reason: string
}

export interface Withdrawal {
  date: string,
  race: number,
  horse: string,
  standby: boolean
}

export interface Suspension {
  race: number,
  horse: string,
  player: string,
  startAt: string,
  resumeAt: string,
  racedays: number
}
