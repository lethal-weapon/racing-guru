export interface PlayerWinner {
  player: string,
  seasonWins: number,
  careerWins: number,
  meetingsSinceLastWin: number,
  startsSinceLastWin: number,
  averageStartsPerWin: number,
  closeToMilestone: boolean,
  reachedMilestone: boolean
}

export interface PlayerBirthday {
  player: string,
  date: string,
  age: number
}

export interface Reminder {
  meeting: string,
  winners: PlayerWinner[],
  birthdays: PlayerBirthday[]
}

export const DEFAULT_PLAYER_WINNER: PlayerWinner = {
  player: '',
  seasonWins: 0,
  careerWins: 0,
  meetingsSinceLastWin: 0,
  startsSinceLastWin: 0,
  averageStartsPerWin: 0,
  closeToMilestone: false,
  reachedMilestone: false
}
