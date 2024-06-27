import {Selection} from './dto.model';

export interface Pick {
  meeting: string,
  races: RacePick[]
}

export interface RacePick {
  race: number,
  favorites: number[],
  selections: Selection[]
}
