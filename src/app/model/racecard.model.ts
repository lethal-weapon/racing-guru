import {Pool} from './pool.model';
import {Odds} from './odds.model';
import {Starter} from './starter.model';
import {Dividend} from './dividend.model';
import {Favorite} from './favorite.model';

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
    public starters   : Starter[],
    public favorite   : Favorite,
    public course    ?: string,
    public pool      ?: Pool,
    public odds      ?: Odds,
    public dividend  ?: Dividend
  ) {
  }
}