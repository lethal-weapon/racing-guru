export class Syndicate {
  constructor(
    public id: string,
    public members: string[],
    public horses: string[]
  ) {
  }
}

export interface SyndicateSnapshot {
  meeting: string,
  venue: string,
  syndicates: MeetingSyndicate[],
  soleStarters: StarterSnapshot[],
  performances: OwnerPerformance[]
}

export interface StarterSnapshot {
  race: number,
  order: number,
  draw: number,
  placing: number,
  winOdds: number,
  horse: string,
  horseNameCH: string,
  jockey: string,
  trainer: string,
  scratched: boolean,
}

export interface MeetingSyndicate {
  syndicateId: string
  syndicateMembers: number,
  syndicateActiveHorses: number,
  starterCount: number,
  starters: StarterSnapshot[],
}

export interface OwnerPerformance {
  race: number,
  single: string,
  multiple: string,
  sole: string,
}
