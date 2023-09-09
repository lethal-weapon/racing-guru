import {Starter, StarterChange} from './starter.model';
import {Pool} from './pool.model';
import {Odds} from './odds.model';
import {Dividend} from './dividend.model';
import {Signal} from './signal.model';
import {Selection} from './dto.model';

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
    public url        : string,
    public videoUrl   : string,
    public resultUrl  : string,
    public starters   : Starter[],
    public changes    : StarterChange[],
    public favorites  : number[],
    public selections : Selection[],
    public course    ?: string,
    public pool      ?: Pool,
    public odds      ?: Odds,
    public dividend  ?: Dividend,
    public signal    ?: Signal
  ) {
  }
}