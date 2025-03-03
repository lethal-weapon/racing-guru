import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {Racecard} from '../model/racecard.model';
import {CUTOFF_GAP_MINUTES, GameSession, SESSION_RANGES, STAKE_LEVELS} from '../model/game.model';

@Component({
  selector: 'app-game-entry',
  templateUrl: './game-entry.component.html'
})
export class GameEntryComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  getEntryCutoffRemainingTime = (sessionFirstRacePostTime: string): string => {
    const firstRacePostTimeMS = new Date(sessionFirstRacePostTime).getTime();
    const cutoffTime = firstRacePostTimeMS - CUTOFF_GAP_MINUTES * 60 * 1000;

    const currTime = new Date().getTime();
    const diff = Math.floor((cutoffTime - currTime) / 1000);

    if (diff < 0) return `-`;
    if (diff < 100) return `${diff} sec`;
    if (diff < 3_600) return `${Math.floor(diff / 60)} min`;
    if (diff <= 36_000) return `${(diff / 3600).toFixed(1)} hrs`;
    return `${Math.floor(diff / 3600)} hrs`;
  }

  get sessions(): GameSession[] {
    return STAKE_LEVELS
      .flatMap(sl =>
        SESSION_RANGES.map(sr => {

          const midRace = Math.floor(this.maxRace / 2);
          let races = Array(this.maxRace).fill(1).map((_, index) => 1 + index);

          if (sr === '1st Half') {
            races = Array(midRace).fill(1).map((_, index) => 1 + index);
          }
          if (sr === '2nd Half') {
            races = Array(this.maxRace - midRace)
              .fill(midRace + 1)
              .map((r, index) => r + index);
          }

          const firstRacePostTime =
            this.racecards.find(r => r.race === races[0])?.time || '';

          return {
            meeting: this.racecards[0].meeting,
            venue: this.racecards[0].venue,
            range: sr,
            races: races,
            firstRacePostTime: firstRacePostTime,
            entryFee: sl === 'Low Roller' ? 5 : (sl === 'Mid Roller' ? 10 : 25),
            currentParticipants: 16,
            minimumParticipants: sl === 'Low Roller' ? 100 : (sl === 'Mid Roller' ? 50 : 20),
            stakeLevel: sl,
            status: 'Open',
          };
        })
      );
  }

  get maxRace(): number {
    return Math.max(...this.racecards.map(r => r.race));
  }

  get racecards(): Racecard[] {
    return this.repo.findRacecards();
  }
}
