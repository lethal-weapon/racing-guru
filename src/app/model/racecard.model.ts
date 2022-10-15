import {Tip} from './tip.model';
import {Pool} from './pool.model';
import {Odds} from './odds.model';
import {Starter} from './starter.model';
import {Dividend} from './dividend.model';

export class Racecard {
  constructor(
    public meeting    : string,
    public race       : number,
    public time       : string,
    public grade      : string,
    public name       : string,
    public venue      : string,
    public distance   : number,
    public prize      : number,
    public track      : string,
    public videoUrl   : string,
    public resultUrl  : string,
    public course    ?: string,
    public starters  ?: Starter[],
    public tips      ?: Tip[],
    public pool      ?: Pool,
    public odds      ?: Odds,
    public dividend  ?: Dividend
  ) {
  }
}