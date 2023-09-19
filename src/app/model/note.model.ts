export interface PersonWinner {
  person: string,
  season: number,
  career: number
}

export interface PersonBirthday {
  person: string,
  date: string,
  age: number
}

export interface Note {
  meeting: string,
  birthdays: PersonBirthday[],
  blacklist: PersonWinner[],
  whitelist: PersonWinner[]
}
