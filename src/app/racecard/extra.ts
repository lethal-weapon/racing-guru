// getMeetingWinnerBeforeActiveRace = (player: string): number =>
//   this.racecards
//     .filter(r => r.race < this.activeRace)
//     .flatMap(r => r.starters)
//     .filter(s => [s.jockey, s.trainer].includes(player))
//     .filter(s => (s?.placing || 0) === 1)
//     .length;
//
// getStarterStatSumColor = (starter: Starter, index: number): string => {
//   const starterSum = this.getPersonStatOnPlacing(starter, index)[2];
//   const isTopSum = this.startersSortedByChance
//     .map(s => this.getPersonStatOnPlacing(s, index)[2])
//     .filter((s, i, arr) => arr.indexOf(s) === i)
//     .sort((s1, s2) => s1 - s2)
//     .slice(0, 3)
//     .includes(starterSum);
//
//   return isTopSum ? COLORS[index] : '';
// }
//
// getPersonStatOnPlacing = (starter: Starter, index: number): number[] => {
//   const stats = [starter.jockey, starter.trainer]
//     .map(p => this.getPersonStartsOnPlacing(p))
//     .map(s => [s.wins, s.seconds, s.thirds, s.fourths][index]);
//
//   return stats.concat([stats[0] + stats[1]]);
// }
//
// getPersonStartsOnPlacing = (player: string): PlayerSummary => {
//   let ps: PlayerSummary = {
//     player: player,
//     wins: 0,
//     seconds: 0,
//     thirds: 0,
//     fourths: 0,
//     engagements: 0,
//     earnings: 0,
//     starters: []
//   };
//
//   let done = [false, false, false, false];
//   const colls = this.repo.findCollaborations()
//     .filter(c => c.jockey === player || c.trainer === player);
//   const starts = this.getPersonStarters(player, colls, 100)
//     .filter(s => s.winOdds > 0 && s.placing > 0);
//
//   for (let j = 0; j < starts.length; j++) {
//     if (starts[j].placing >= 1 && starts[j].placing <= 4) {
//       done[starts[j].placing - 1] = true;
//     }
//
//     if (done.every(d => d)) break;
//
//     done.forEach((d, index) => {
//       if (!d) {
//         if (index === 0) ps.wins += 1;
//         if (index === 1) ps.seconds += 1;
//         if (index === 2) ps.thirds += 1;
//         if (index === 3) ps.fourths += 1;
//       }
//     });
//   }
//
//   return ps;
// }
//
// getPlayerSections = (starter: Starter): PersonSection[] =>
//   [
//     (this.repo.findCollaborations().filter(c => c.jockey === starter.jockey) || []),
//     (this.repo.findCollaborations().filter(c => c.trainer === starter.trainer) || [])
//   ].map((colls, index) => ({
//       player: index === 0 ? starter.jockey : starter.trainer,
//       wins: colls.map(c => c.wins).reduce((prev, curr) => prev + curr, 0),
//       seconds: colls.map(c => c.seconds).reduce((prev, curr) => prev + curr, 0),
//       thirds: colls.map(c => c.thirds).reduce((prev, curr) => prev + curr, 0),
//       fourths: colls.map(c => c.fourths).reduce((prev, curr) => prev + curr, 0),
//       starters: this.getPersonStarters(
//         index === 0 ? starter.jockey : starter.trainer,
//         colls
//       )
//     })
//   )

// interface PersonStarter {
//   meeting: string,
//   race: number,
//   partner: string,
//   horse: string,
//   placing: number,
//   winOdds: number
// }
//
// interface PersonSection {
//   person: string
//   wins: number,
//   seconds: number,
//   thirds: number,
//   fourths: number,
//   starters: PersonStarter[]
// }

// getPersonStarters = (player: string, collaborations: Collaboration[], limit: number = 20): PersonStarter[] =>
//   collaborations
//     .map(c =>
//       c.starters.map(s => ({
//         meeting: s.meeting,
//         race: s.race,
//         partner: [c.jockey, c.trainer].find(p => p !== player) || '?',
//         horse: s.horseNameCH,
//         placing: s?.placing || 0,
//         winOdds: s?.winOdds || 0
//       }))
//     )
//     .reduce((prev, curr) => prev.concat(curr), [])
//     .filter(s => {
//       if (s.meeting !== getCurrentMeeting(this.racecards)) return true;
//       return s.meeting === getCurrentMeeting(this.racecards) && s.race < this.activeRace;
//     })
//     .sort((r1, r2) =>
//       r2.meeting.localeCompare(r1.meeting) || r2.race - r1.race
//     )
//     .slice(0, limit)
