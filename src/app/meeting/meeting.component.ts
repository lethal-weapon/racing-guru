import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {WebsocketService} from '../model/websocket.service';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {Syndicate} from '../model/syndicate.model';
import {ChallengeOdds, DEFAULT_CHALLENGE_ODDS} from '../model/odds.model';
import {TrackworkGrade} from '../model/trackwork.model';
import {JOCKEYS, TRAINERS} from '../model/person.model';
import {PAYOUT_RATE, THREE_SECONDS} from '../util/numbers';
import {BOUNDARY_JOCKEYS, BOUNDARY_POOLS, BOUNDARY_TRAINERS, RATING_GRADES} from '../util/strings';
import {DEFAULT_COMBINATIONS, DEFAULT_SINGULARS, DividendPool} from '../model/dividend.model';
import {
  getCurrentMeeting,
  getHorseProfileUrl,
  getMaxRace,
  getNewFavorites,
  getOddsIntensityColor,
  getPlacing,
  getPlacingColor,
  getStarter,
  getStarterWinPlaceOdds,
  getTrainer,
  getWinPlaceOdds,
  toMillion
} from '../util/functions';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html'
})
export class MeetingComponent implements OnInit {
  racecards: Racecard[] = [];

  remainingTime: string = '---';
  activeTrainer: string = '';
  activeDraw: number = 0;

  protected readonly RATING_GRADES = RATING_GRADES;
  protected readonly BOUNDARY_POOLS = BOUNDARY_POOLS;
  protected readonly getMaxRace = getMaxRace;
  protected readonly getStarter = getStarter;
  protected readonly getTrainer = getTrainer;
  protected readonly getWinPlaceOdds = getWinPlaceOdds;
  protected readonly getPlacingColor = getPlacingColor;
  protected readonly getHorseProfileUrl = getHorseProfileUrl;
  protected readonly getOddsIntensityColor = getOddsIntensityColor;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService
  ) {
    socket.addCloseCallback(() => socket.racecards.unsubscribe());
    socket.addReconnectCallback(() =>
      socket.racecards.subscribe(data => this.racecards = data));

    socket.racecards.subscribe(data => this.racecards = data);
  }

  ngOnInit(): void {
    setInterval(() => {
      this.socket.racecards.next([]);
      this.tick();
    }, THREE_SECONDS);

    this.repo.fetchMeetingHorses();
    this.repo.fetchSyndicates();
    this.repo.fetchTrackworkGrades();
  }

  setActiveTrainer = (clicked: string) =>
    this.activeTrainer = this.activeTrainer === clicked ? '' : clicked

  setActiveDraw = (clicked: number) =>
    this.activeDraw = this.activeDraw === clicked ? 0 : clicked

  tick = () => {
    if (!this.next) {
      this.remainingTime = `---`;
      return;
    }

    const raceTime = new Date(this.next.time).getTime();
    const currTime = new Date().getTime();
    const diff = Math.floor((raceTime - currTime) / 1000);

    if (diff <= 600) this.remainingTime = `${diff} sec`
    else if (diff <= 5400) this.remainingTime = `${Math.floor(diff / 60)} min`
    else this.remainingTime = `${Math.floor(diff / 3600)} hrs`

    let audioName = '';
    if (diff >= 899 && diff <= 901) audioName = '15-min-horse'
    else if (diff >= 599 && diff <= 601) audioName = '10-min-door'
    else if (diff >= 299 && diff <= 301) audioName = '5-min-rooster'
    else if (diff >= 179 && diff <= 181) audioName = '3-min-instrument'
    else if (diff >= 59 && diff <= 61) audioName = '1-min-alarm'

    if (audioName.length > 0) {
      let audio = new Audio(`../../assets/audio/${audioName}.wav`);
      audio.load();
      audio.play();
    }
  }

  toggleFavorite = (starter: Starter, racecard: Racecard) => {
    this.repo.saveFavorite({
      meeting: getCurrentMeeting(this.racecards),
      race: racecard.race,
      favorites: getNewFavorites(starter, racecard)
    });
  }

  isHighlightEarning = (jockey: string): boolean =>
    this.getMeetingEarning(jockey) >= 12

  isPersonalFavorite = (starter: Starter, racecard: Racecard): boolean =>
    racecard.favorites.includes(starter.order)

  isComingFavoured = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race < this.nextRace) return false;
    return this.isPublicFavorite(jockey, racecard);
  }

  isPublicFavorite = (jockey: string, racecard: Racecard): boolean => {
    if (!racecard.odds) return false;

    const order = getStarter(jockey, racecard).order;
    const favouredOrder = racecard.odds.winPlace
      .map(o => o)
      .sort((o1, o2) => o1.win - o2.win)
      .shift()
      ?.order;

    return order === favouredOrder;
  }

  getMeetingEarning = (jockey: string): number =>
    parseFloat(this.racecards
      .filter(r => getPlacing(jockey, r) > 0)
      .map(r => this.getRaceEarning(jockey, r))
      .reduce((prev, curr) => prev + curr, 0)
      .toFixed(1)
    )

  getRaceEarning = (jockey: string, racecard: Racecard): number => {
    const placing = getPlacing(jockey, racecard);
    const odds = this.getWinPlaceOdds(jockey, racecard);
    const order = odds.order;

    if ([1, 2, 3].includes(placing)) {
      const win = racecard.dividend?.win?.filter(w => w.order === order).pop();
      const pla = racecard.dividend?.place?.filter(p => p.order === order).pop();
      if (placing === 1) return win?.odds || 0;
      if (placing === 2) return (pla?.odds || 0) + (odds.win / 10);
      return pla?.odds || (odds.win / 10);
    }

    return placing === 4 ? odds.win / 10 : 0;
  }

  isTrainerLastRace = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race === this.maxRace) return false;

    const trainer = getTrainer(jockey, racecard);
    return racecard === this.racecards
      .filter(r => r.starters.map(s => s.trainer).includes(trainer))
      .pop();
  }

  emphasiseTrainer = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race >= this.maxRace - 1) return false;
    if (this.isTrainerLastRace(jockey, racecard)) return false;

    const next = racecard.race + 1;
    const trainer = getTrainer(jockey, racecard);

    // @ts-ignore
    return !this.racecards
      .filter(r => r.race === next)
      .pop()
      .starters
      .map(s => s.trainer)
      .includes(trainer);
  }

  hideBottomBorder = (jockey: string, racecard: Racecard): boolean =>
    !(
      racecard.race === this.lastRace
      || racecard.race === this.maxRace
      || this.rideThisRace(jockey, racecard)
      || this.rideNextRace(jockey, racecard)
    )

  hideRightBorder = (jockey: string, racecard: Racecard): boolean =>
    !(
      jockey === this.jockeys.pop()
      || this.isBoundaryJockey(jockey)
      || this.rideThisRace(jockey, racecard)
      || this.rideThisRace(this.jockeys[this.jockeys.indexOf(jockey) + 1], racecard)
    )

  rideThisRace = (jockey: string, racecard: Racecard): boolean =>
    racecard.starters.map(s => s.jockey).includes(jockey);

  rideNextRace = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race >= this.maxRace) return false;

    const nextRacecard =
      this.racecards.filter(r => r.race === racecard.race + 1).pop();

    // @ts-ignore
    return this.rideThisRace(jockey, nextRacecard);
  }

  isSpecialRace = (race: Racecard): boolean =>
    !(
      race.track === 'TURF'
      && race.grade.startsWith('C')
      && race.distance > 1000
      && (!race.name.includes('CUP'))
      && (!race.name.includes('TROPHY'))
      && (!race.name.includes('CHALLENGE'))
      && (!race.name.includes('CHAMPIONSHIP'))
      && (
        race.grade.endsWith('3')
        || race.grade.endsWith('4')
        || race.grade.endsWith('5')
      )
    )

  isBoundaryJockey = (jockey: string): boolean => {
    let specials = []
    for (const j of BOUNDARY_JOCKEYS) {
      if (this.jockeys.includes(j)) {
        if (this.jockeys.indexOf(j) !== this.jockeys.length - 1) {
          specials.push(j);
        }
      } else {
        let priorIndex = JOCKEYS.map(j => j.code).indexOf(j);
        let priorJockey = j;
        while (!this.jockeys.includes(priorJockey) && priorIndex > 0) {
          priorIndex -= 1;
          priorJockey = JOCKEYS[priorIndex].code;
        }
        specials.push(priorJockey);
      }
    }
    return specials.includes(jockey);
  }

  isPreferredChallenger = (personType: string, order: number): boolean => {
    const co = this.getChallengeOdds(personType, order);
    return co.points >= 6 && co.odds >= 8 && co.odds <= 60;
  }

  isTop3Starter = (jockey: string, racecard: Racecard): boolean => {
    return racecard.starters
      .filter(s => !s.scratched)
      .sort((s1, s2) =>
        ((s2?.chance || 0) - (s1?.chance || 0)) || (s1.order - s2.order)
      )
      .map(s => s.jockey)
      .slice(0, 3)
      .includes(jockey);
  }

  formatChallengeOdds = (odds: number): string => {
    if (odds < 1) return '';
    else if (odds > 99) return '99+'
    else return `${odds}`;
  }

  formatRaceGrade = (grade: string): string => {
    const clean = grade
      .replace('(', '')
      .replace(')', '')
      .replace('RESTRICTED', '')
      .replace('4 YEAR OLDS', '4Y')
      .replace('GRIFFIN RACE', 'GF')
      .trim();
    return `${clean[0]}${clean.slice(-1)}`
  }

  getStarterTooltip = (jockey: string, racecard: Racecard): string => {
    const starter = racecard.starters.find(s => s.jockey === jockey);
    if (!starter) return '';

    const horse = this.repo.findHorses().find(h => h.code === starter.horse);
    if (!horse) return '';

    return `
      <div class="w-44 text-center">
        <div>${horse.nameCH}</div>
        <div>${horse.nameEN}</div>
      </div>
    `;
  }

  getRaceTooltip = (racecard: Racecard): string => {
    const name = racecard.name
      .replace('(', '')
      .replace(')', '')
      .replace('HANDICAP', '')
      .replace('CHINESE NEW YEAR', 'CNY')
      .replace('INTERNATIONAL JOCKEYS\' CHAMPIONSHIP', 'IJC')
      .replace(/\d{4}M/g, '')
      .trim();

    const dt = new Date(racecard.time);
    let time = `${dt.getHours()} : ${dt.getMinutes()}`;
    if (dt.getMinutes() === 0) time += '0';
    else if (dt.getMinutes() < 10) {
      time = `${dt.getHours()} : 0${dt.getMinutes()}`;
    }

    let track = racecard.track.toUpperCase();
    if (track !== 'TURF') track = 'AWT';
    const trackColor = track === 'TURF' ? 'text-green-600' : 'text-orange-400';

    const prize = `$${toMillion(racecard.prize)}M`;

    return `
      <div class="w-44">
        <div class="text-center">${name}</div>
        <div class="flex flex-row justify-evenly">
          <div class="text-red-600">${time}</div>
          <div class="${trackColor}">${track}</div>
          <div class="text-yellow-400">${prize}</div>
        </div>
      </div>
    `;
  }

  getDividendOdds = (race: number, pool: string): number => {
    const d = this.racecards.find(r => r.race === race)?.dividend;
    try {
      switch (pool) {
        case 'WIN':
          return (d?.win || DEFAULT_SINGULARS)[0].odds
        case 'QIN':
          return Math.floor((d?.quinella || DEFAULT_COMBINATIONS)[0].odds)
        case 'FCT':
          return Math.floor((d?.forecast || DEFAULT_COMBINATIONS)[0].odds)
        case 'TRI':
          return Math.floor((d?.trio || DEFAULT_COMBINATIONS)[0].odds)
        case 'F-F':
          return Math.floor((d?.firstFour || DEFAULT_COMBINATIONS)[0].odds)
        case 'TCE':
          return Math.floor((d?.tierce || DEFAULT_COMBINATIONS)[0].odds)
        case 'QTT':
          return Math.floor((d?.quartet || DEFAULT_COMBINATIONS)[0].odds)

        case 'PLA-1':
          return (d?.place || DEFAULT_SINGULARS)[0].odds
        case 'PLA-2':
          return (d?.place || DEFAULT_SINGULARS)[1].odds
        case 'PLA-3':
          return (d?.place || DEFAULT_SINGULARS)[2].odds

        case 'QPL-1':
          return (d?.quinellaPlace || DEFAULT_COMBINATIONS)[0].odds
        case 'QPL-2':
          return (d?.quinellaPlace || DEFAULT_COMBINATIONS)[1].odds
        case 'QPL-3':
          return (d?.quinellaPlace || DEFAULT_COMBINATIONS)[2].odds

        case 'DBL-1':
          return Math.floor((d?.double || DEFAULT_COMBINATIONS)[0].odds)
        case 'DBL-2':
          return (d?.double || DEFAULT_COMBINATIONS)[1].odds

        default:
          return 0
      }
    } catch (e) {
      return 0;
    }
  }

  getDividendTop4 = (race: number): number[] => {
    const dividend = this.racecards.find(r => r.race === race)?.dividend;
    const tierce = dividend?.tierce;
    const quartet = dividend?.quartet;

    if (!tierce) return [];
    let orders = tierce[0].orders;
    if (quartet) orders = quartet[0].orders;

    return orders;
  }

  getHorseDetail = (horse: string, race: number):
    { name: string, order: number, odds: number, jockey: string, trainer: string } => ({

    name: this.repo.findHorses().find(h => h.code === horse)?.nameCH || '?',
    order: this.starters.find(s => s.horse === horse)?.order || 0,
    odds: getWinPlaceOdds(
      this.starters.find(s => s.horse === horse)?.jockey || '',
      // @ts-ignore
      this.racecards.find(r => r.race === race)
    ).win,
    jockey: this.starters.find(s => s.horse === horse)?.jockey || '?',
    trainer: this.starters.find(s => s.horse === horse)?.trainer || '?'
  })

  getPlacingColorByHorse = (horse: string, race: number): string => {
    const racecard = this.racecards.find(r => r.race === race);
    if (!racecard) return '';

    const jockey = racecard.starters.find(s => s.horse === horse)?.jockey || '';
    return getPlacingColor(jockey, racecard);
  }

  getChallengeOdds = (personType: string, order: number): ChallengeOdds => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return DEFAULT_CHALLENGE_ODDS;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => !o.outsider)
      ?.find(o => o.order === order) || DEFAULT_CHALLENGE_ODDS;
  }

  getChallengerInvestment = (challenger: string): number =>
    this.racecards
      .map(r => r.starters
        .filter(s => s.jockey === challenger || s.trainer === challenger)
        .map(s => getStarterWinPlaceOdds(s, r).win)
        .filter(wo => wo && wo > 0)
        .map(wo => PAYOUT_RATE / wo)
        .reduce((prev, curr) => prev + curr, 0)
      )
      .reduce((prev, curr) => prev + curr, 0)

  getSyndicateServiceHorseCount = (horses: string[]): number =>
    this.repo.findHorses()
      .filter(h => horses.includes(h.code))
      .filter(h => !h.retired)
      .length;

  getSyndicateStarters = (syn: Syndicate, race: number): string[] =>
    syn.horses
      .filter(h =>
        this.racecards.find(r => r.race === race)
          ?.starters
          .map(s => s.horse)
          .includes(h)
      )

  getTrackworkGrades = (race: number, grade: string): TrackworkGrade[] =>
    this.repo.findTrackworkGrades()
      .filter(g => g.race === race && g.grade === grade)
      .sort((g1, g2) => g1.order - g2.order)

  getStartersByTrainerGroup = (race: number, groupIndex: number): Starter[] => {
    let startIndex = 0;
    if (groupIndex > 0) {
      startIndex = 1 + TRAINERS.findIndex(p => p.code === BOUNDARY_TRAINERS[groupIndex - 1]);
    }

    let endIndex = groupIndex < BOUNDARY_TRAINERS.length
      ? TRAINERS.findIndex(p => p.code === BOUNDARY_TRAINERS[groupIndex])
      : TRAINERS.length - 1;

    // @ts-ignore
    return TRAINERS
      .filter((_, i) => i >= startIndex && i <= endIndex)
      .map(t => t.code)
      .filter(t => this.racecards
        .find(r => r.race === race)
        ?.starters
        .map(s => s.trainer)
        .includes(t)
      )
      .map(t =>
        this.racecards
          .find(r => r.race === race)
          ?.starters
          .filter(s => s.trainer === t)
          .sort((s1, s2) => s1.order - s2.order)
      )
      .flatMap(s => s);
  }

  get syndicates(): Syndicate[] {
    return this.repo.findSyndicates()
      .filter(s => s.horses
        .filter(h => this.starters.map(s => s.horse).includes(h))
        .length > 1
      )
      .sort((s1, s2) =>
        (
          s2.horses.filter(h => this.starters.map(s => s.horse).includes(h)).length -
          s1.horses.filter(h => this.starters.map(s => s.horse).includes(h)).length
        )
        ||
        (
          this.getSyndicateServiceHorseCount(s2.horses) -
          this.getSyndicateServiceHorseCount(s1.horses)
        )
        ||
        s2.members.length - s1.members.length
        ||
        s1.id - s2.id
      );
  }

  get dividendPools(): DividendPool[] {
    return [
      {name: 'WIN', threshold: 8},
      {name: 'QIN', threshold: 40},
      {name: 'FCT', threshold: 80},
      {name: 'TRI', threshold: 100},
      {name: 'F-F', threshold: 100},
      {name: 'TCE', threshold: 300},
      {name: 'QTT', threshold: 3000},
      {name: 'PLA-1', threshold: 4},
      {name: 'PLA-2', threshold: 4},
      {name: 'PLA-3', threshold: 4},
      {name: 'QPL-1', threshold: 20},
      {name: 'QPL-2', threshold: 20},
      {name: 'QPL-3', threshold: 20},
      {name: 'DBL-1', threshold: 60},
      {name: 'DBL-2', threshold: 20},
    ];
  }

  get pools(): Array<{ pool: string, amount: string }> {
    const pool = (this.next || this.racecards[this.racecards.length - 1])?.pool;
    return [
      {pool: 'W', amount: toMillion(pool?.win || 0)},
      {pool: 'Q', amount: toMillion(pool?.quinella || 0)},
      {pool: 'FCT', amount: toMillion(pool?.forecast || 0)},
      {pool: 'FQ', amount: toMillion(pool?.quartet || 0)},
      {pool: 'P', amount: toMillion(pool?.place || 0)},
      {pool: 'QP', amount: toMillion(pool?.quinellaPlace || 0)},
      {pool: 'TCE', amount: toMillion(pool?.tierce || 0)},
      {pool: 'DBL', amount: toMillion(pool?.double || 0)},
    ]
  }

  get summary(): string[] {
    const racecard = this.racecards.find(r => r.race === 1);
    if (!racecard) return [];

    const date = racecard.meeting;
    const venue = racecard.venue;
    const course = this.racecards.find(r => r.course)?.course || 'AWT';
    const races = this.racecards.length;
    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', {weekday: 'short'})
      .toUpperCase();

    const horses = this.starters.length;
    const jockeys = this.jockeys.length;
    const trainers = this.trainers.length;

    return [
      `${dayOfWeek}, ${date}, ${venue}, ${course} Course`,
      `${races} Races, ${jockeys} Jockeys, ${trainers} Trainers, ${horses} Horses`
    ];
  }

  get trainers(): string[] {
    const meetingTrainers = new Set(this.starters.map(s => s.trainer));
    return TRAINERS.map(t => t.code).filter(t => meetingTrainers.has(t));
  }

  get jockeys(): string[] {
    const meetingJockeys = new Set(this.starters.map(s => s.jockey));
    return JOCKEYS.map(j => j.code).filter(j => meetingJockeys.has(j));
  }

  get starters(): Starter[] {
    return this.racecards
      .map(r => r.starters)
      .reduce((prev, curr) => prev.concat(curr), []);
  }

  get maxChallengerOrder(): number {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return [...odds?.jkc, ...odds?.tnc]
      .filter(o => !o.outsider)
      .map(o => o.order)
      .sort((o1, o2) => o1 - o2)
      .pop() || 0;
  }

  get maxRace(): number {
    return this.racecards.map(r => r.race).pop() || 0;
  }

  get lastRace(): number {
    return this.nextRace - 1;
  }

  get nextRace(): number {
    return this.next?.race || 13;
  }

  get next(): Racecard | undefined {
    return this.racecards.filter(r => !r.dividend?.win).shift();
  }

  get isLoading(): boolean {
    return this.racecards.length === 0;
  }
}