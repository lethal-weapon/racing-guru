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

export const TRAINERS = [
  new Player(
    'NPC',
    '1983-08-02',
    'Ng',
    'Pang-chi',
    'P C Ng',
    'Pierre',
    'HK',
    '',
    [{upToDate: '2022-09-11', wins: 0}],
    1,
    false,
    true,
    false,
    false
  ),
]

export const JOCKEYS = [
  new Player(
    'PZ',
    '1983-01-03',
    'Purton',
    'Zac',
    'Z Purton',
    '',
    'AUS',
    'Club',
    [{upToDate: '2022-09-11', wins: 1431}],
    1,
    true,
    true,
    false,
    false
  ),
]
