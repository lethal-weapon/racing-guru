export class Player {
  constructor(
    public code: string,
    public dateOfBirth: string,
    public lastName: string,
    public firstName: string,
    public shortName: string,
    public nickname: string,
    public nationality: string,
    public licence: string,
    public careerWins: CareerWin[],
    public order: number,
    public jockey: boolean,
    public active: boolean,
    public boundary: boolean,
    public newcomer: boolean
  ) {
  }
}

export interface CareerWin {
  upToDate: string,
  wins: number
}

export const DEFAULT_PLAYER: Player = {
  code: 'XXX',
  dateOfBirth: '1980-01-01',
  lastName: 'Smith',
  firstName: 'John',
  shortName: 'J Smith',
  nickname: 'John',
  nationality: 'HK',
  licence: 'Club',
  careerWins: [{upToDate: '2023-09-01', wins: 0}],
  order: 0,
  jockey: true,
  active: true,
  boundary: false,
  newcomer: false
}
