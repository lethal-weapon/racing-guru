import {ChallengeOdds} from './odds.model';

export interface ChallengeSnapshot {
  meeting: string,
  venue: string,
  jkc: ChallengeOdds[],
  tnc: ChallengeOdds[]
}
