import {Component, OnInit} from '@angular/core';

import {RaceHorse} from '../model/racehorse.model';
import {RestRepository} from '../model/rest.repository';

export interface Matcher {
  kind: string,
  horses: RaceHorse[]
}

@Component({
  selector: 'app-matcher',
  templateUrl: './matcher.component.html'
})
export class MatcherComponent implements OnInit {

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchRacehorses();
  }

  matchNameEN(horse1: string, horse2: string): boolean {
    const pieces = [horse1, horse2].map(h => h
      .toUpperCase()
      .replace('\'', '')
      .split(' ')
      .filter(s => s.length > 0)
    )
    return pieces[0].filter(p => pieces[1].includes(p)).length > 0;
  }

  matchNameCH(horse1: string, horse2: string): boolean {
    for (let i = 0; i < horse1.length - 1; i++) {
      const dual = `${horse1[i]}${horse1[i + 1]}`
      if (horse2.includes(dual)) return true;
    }
    if (horse1.length === 3 && horse2.length === 3) {
      if (horse1[0] === horse2[0] && horse1[2] === horse2[2]) return true;
    }
    return false;
  }

  getMatchesByMeeting(meeting: string, horses: RaceHorse[]): RaceHorse[] {
    return horses.filter(h => h.meeting === meeting);
  }

  get nameMatches(): Matcher[] {
    let matches: Matcher[] = [];
    let done: Set<RaceHorse> = new Set();

    for (let i = 0; i < this.racehorses.length; i++) {
      const horse1 = this.racehorses[i];
      if (done.has(horse1)) continue;

      done.add(horse1);
      let existing: RaceHorse[] = [horse1];

      for (let j = i + 1; j < this.racehorses.length; j++) {
        const horse2 = this.racehorses[j];
        if (done.has(horse2)) continue;

        if (existing.some(e => this.matchNameCH(e.horseNameCH, horse2.horseNameCH))) {
          existing.push(horse2);
          done.add(horse2);
        }
      }

      if (existing.length == 1) continue;
      if (existing.length == 2 && existing[0].horse == existing[1].horse) continue;

      matches.push({kind: 'NameCH', horses: existing});
    }

    return matches;
  }

  get exactMatches(): Matcher[] {
    let matches: Matcher[] = [];

    const uniqueCodes = this.racehorses
      .map(h => h.horse)
      .filter((e, i, arr) => i === arr.indexOf(e));

    uniqueCodes.forEach(c => {
      const sames = this.racehorses.filter(h => h.horse === c);
      if (sames.length > 1) matches.push({kind: 'Exact', horses: sames});
    });

    return matches.sort((m1, m2) =>
      m1.horses[0].trainer.localeCompare(m2.horses[0].trainer));
  }

  get matches(): Matcher[] {
    return this.exactMatches.concat(this.nameMatches);
  }

  get meetings(): string[] {
    return this.racehorses
      .map(o => o.meeting)
      .filter((e, i, arr) => i === arr.indexOf(e));
  }

  get racehorses(): RaceHorse[] {
    return this.repo.findRacehorses();
  }
}