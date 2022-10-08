import {Tip} from './tip.model';
import {Pool} from './pool.model';
import {Odds} from './odds.model';
import {Dividend} from './dividend.model';
import {Starter} from './starter.model';

export class Racecard {
  constructor(
    public raceDate   : string,
    public raceNum    : number,
    public raceTime   : string,
    public raceClass  : string,
    public name       : string,
    public venue      : string,
    public distance   : number,
    public prize      : number,
    public track      : string,
    public videoUrl   : string,
    public resultUrl  : string,
    public starters   : Starter[],
    public course    ?: string,
    public tips      ?: Tip[],
    public pool      ?: Pool,
    public odds      ?: Odds,
    public dividend  ?: Dividend
  ) {
  }
}