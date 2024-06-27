import {Starter, StarterChange} from './starter.model';
import {Pool} from './pool.model';
import {Odds} from './odds.model';
import {Dividend} from './dividend.model';
import {Signal} from './signal.model';

export interface Racecard {
  meeting: string,
  race: number,
  venue: string,
  time: string,
  name: string,
  grade: string,
  track: string,
  course: string,
  distance: number,
  prize: number,
  replayUrl: string,
  resultUrl: string,
  starters: Starter[],
  changes: StarterChange[],
  pool: Pool,
  odds: Odds,
  signal: Signal,
  dividend: Dividend
}
