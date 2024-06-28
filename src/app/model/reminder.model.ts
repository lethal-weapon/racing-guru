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
