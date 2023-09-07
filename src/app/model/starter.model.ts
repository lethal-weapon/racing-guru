export class Rating {
  constructor(
    public factor : string,
    public grade  : string,
    public score  : number
  ) {
  }
}

export class Starter {
  constructor(
    public order        : number,
    public draw         : number,
    public horse        : string,
    public jockey       : string,
    public trainer      : string,
    public ratings      : Rating[],
    public scratched    : boolean,
    public interviewed  : boolean,
    public interviewee ?: string,
    public chance      ?: number,
    public placing     ?: number,
    public winOdds     ?: number
  ) {
  }
}

export class StarterChange {
  constructor(
    public order            : number,
    public scratched        : boolean,
    public previousHorse    : string,
    public previousJockey   : string,
    public previousTrainer  : string,
    public currentHorse    ?: string,
    public currentJockey   ?: string,
    public currentTrainer  ?: string,
    public race            ?: number
  ) {
  }
}