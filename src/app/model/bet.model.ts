export interface Bet {
  meeting: string,
  venue: string,
  account: string,
  balance: number,
  computedBalance: number,
  suspicious: boolean,
  fund: number,
  deposit: number,
  withdrawal: number,
  debit: number,
  credit: number,
  betlines: Betline[]
}

export interface Betline {
  race: number,
  command: string,
  debit: number,
  credit: number
}
