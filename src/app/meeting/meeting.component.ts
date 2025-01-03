import {Component, OnInit} from '@angular/core';

import {WebsocketService} from '../websocket.service';
import {RestRepository} from '../model/rest.repository';
import {DEFAULT_PICK, Pick} from '../model/pick.model';
import {Player} from '../model/player.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {DEFAULT_MEETING, Meeting} from '../model/meeting.model';
import {ChallengeOdds, DEFAULT_CHALLENGE_ODDS} from '../model/odds.model';
import {DEFAULT_COMBINATIONS, DEFAULT_SINGULARS} from '../model/dividend.model';
import {BOUNDARY_INVESTMENT_POOLS, BOUNDARY_POOLS} from '../util/strings';
import {EARNING_THRESHOLD, PAYOUT_RATE, THREE_SECONDS} from '../util/numbers';
import {
  formatRace,
  formatRaceTime,
  formatRaceTimeWithoutSpace,
  getStarter,
  getStarterWinPlaceOdds,
  getTrainer,
  getWinPlaceOdds,
  toHorseProfileUrl,
  toMillion,
  toPlacingColor
} from '../util/functions';
import {min} from "rxjs";

interface PoolThreshold {
  name: string,
  threshold: number
}

interface InvestmentPool {
  race: number,
  pool: string,
  amount: string
}

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html'
})
export class MeetingComponent implements OnInit {
  pick: Pick = DEFAULT_PICK;
  meeting: Meeting = DEFAULT_MEETING;
  racecards: Racecard[] = [];

  remainingTime: string = '---';
  activeDraw: number = 0;
  activeChallengers: Set<string> = new Set();

  activeTrainer: string = '';
  activeTrainerIntervalId: any;
  activeTrainerAnimationOn: boolean = false;

  protected readonly BOUNDARY_POOLS = BOUNDARY_POOLS;
  protected readonly BOUNDARY_INVESTMENT_POOLS = BOUNDARY_INVESTMENT_POOLS;
  protected readonly EARNING_THRESHOLD = EARNING_THRESHOLD;
  protected readonly formatRace = formatRace;
  protected readonly formatRaceTimeWithoutSpace = formatRaceTimeWithoutSpace;
  protected readonly toPlacingColor = toPlacingColor;
  protected readonly toHorseProfileUrl = toHorseProfileUrl;
  protected readonly getStarter = getStarter;
  protected readonly getTrainer = getTrainer;
  protected readonly getWinPlaceOdds = getWinPlaceOdds;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService
  ) {
    socket.addPickCallback((newPick: Pick) => {
      if (this.pick.meeting === newPick.meeting) {
        this.pick = newPick;
      }
    });

    socket.addMeetingCallback((newMeeting: Meeting) => {
      if (this.meeting.meeting === newMeeting.meeting) {
        this.meeting = newMeeting;
      }
    });

    socket.addRacecardCallback((newCard: Racecard) => {
      const oldCard = this.racecards
        .find(r => r.meeting === newCard.meeting && r.race === newCard.race);

      if (oldCard) {
        if (oldCard.time != newCard.time) oldCard.time = newCard.time;
        if (oldCard.starters != newCard.starters) oldCard.starters = newCard.starters;
        if (oldCard.changes != newCard.changes) oldCard.changes = newCard.changes;
        if (oldCard.pool != newCard.pool) oldCard.pool = newCard.pool;
        if (oldCard.odds != newCard.odds) oldCard.odds = newCard.odds;
        if (oldCard.signal != newCard.signal) oldCard.signal = newCard.signal;
        if (oldCard.dividend != newCard.dividend) oldCard.dividend = newCard.dividend;
      }
    });
  }

  ngOnInit(): void {
    const meeting = '2025-01-01';

    this.repo.fetchPick(meeting, () => {
      this.pick = this.repo.findPick();
    });

    this.repo.fetchSpecificMeeting(meeting, () => {
      this.meeting = this.repo.findMeetings()[0];
    });

    this.repo.fetchRacecards(meeting, () => {
      this.racecards = this.repo.findRacecards();
    });

    setInterval(() => this.tick(), THREE_SECONDS);
    this.repo.fetchActivePlayers();
    this.repo.fetchMeetingHorses(meeting);
  }

  setActiveDraw = (clicked: number) =>
    this.activeDraw = this.activeDraw === clicked ? 0 : clicked

  getMeetingEarning = (player: string): number =>
    this.meeting.players.find(p => p.player === player)?.earnings || 0

  tick = () => {
    if (!this.next) {
      this.remainingTime = `---`;
      return;
    }

    const raceTime = new Date(this.next.time).getTime();
    const currTime = new Date().getTime();
    const diff = Math.floor((raceTime - currTime) / 1000);

    if (diff <= 600) this.remainingTime = `${diff} sec`;
    else if (diff <= 5_400) this.remainingTime = `${Math.floor(diff / 60)} min`;
    else if (diff <= 36_000) this.remainingTime = `${(diff / 3600).toFixed(1)} hrs`;
    else this.remainingTime = `${Math.floor(diff / 3600)} hrs`;

    if (diff < 0) this.remainingTime = this.remainingTime.replace('-', '+');

    let audioName = '';
    if (diff >= 899 && diff <= 901) audioName = '15-min-horse';
    else if (diff >= 599 && diff <= 601) audioName = '10-min-door';
    else if (diff >= 299 && diff <= 301) audioName = '5-min-rooster';
    else if (diff >= 179 && diff <= 181) audioName = '3-min-instrument';
    else if (diff >= 59 && diff <= 61) audioName = '1-min-alarm';

    if (audioName.length > 0) {
      let audio = new Audio(`../../assets/audio/${audioName}.wav`);
      audio.load();
      audio.play();
    }
  }

  toggleActiveTrainer = (clicked: string) => {
    if (this.activeTrainer === clicked) {
      if (this.activeTrainerIntervalId) {
        clearInterval(this.activeTrainerIntervalId);
        this.activeTrainerIntervalId = null;
      }
      this.activeTrainer = '';
      this.activeTrainerAnimationOn = false;

    } else {
      this.activeTrainer = clicked;
      this.activeTrainerAnimationOn = true;
      if (!this.activeTrainerIntervalId) {
        this.activeTrainerIntervalId = setInterval(() => {
          this.activeTrainerAnimationOn = !this.activeTrainerAnimationOn;
        }, 500);
      }
    }
  }

  toggleActiveChallenger = (clicked: string) => {
    if (this.activeChallengers.has(clicked)) {
      this.activeChallengers.delete(clicked);
    } else {
      this.activeChallengers.add(clicked);
    }
  }

  toggleFavorite = (starter: Starter, racecard: Racecard) => {
    if (this.pick.meeting !== this.racecards[0].meeting) return;

    const order = starter.order;
    const race = racecard.race;
    const favorites = this.pick.races.find(r => r.race === race)?.favorites || [];
    let newFavorites = [...favorites];

    if (favorites.includes(order)) newFavorites = newFavorites.filter(f => f !== order);
    else newFavorites.push(order);

    let newPick: Pick = {...this.pick, races: [...this.pick.races]};
    let newRacePick = newPick.races.find(r => r.race === race);
    if (!newRacePick) return;

    newRacePick.favorites = newFavorites;
    this.repo.savePick(newPick);
  }

  isPastPostTime = (card: Racecard): boolean =>
    (new Date().getTime()) > (new Date(card.time).getTime())

  isPersonalFavorite = (starter: Starter, race: number): boolean =>
    this.pick.races
      .filter(r => r.race === race)
      .some(r => r.favorites.includes(starter.order))

  isUpcomingRacePublicFavorite = (jockey: string, racecard: Racecard): boolean => {
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

  isTrainerFinalRace = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race === this.maxRace) return false;

    const trainer = getTrainer(jockey, racecard);
    return racecard.race === this.racecards
      .filter(r => r.starters.map(s => s.trainer).includes(trainer))
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2)
      .pop();
  }

  isTrainerHasNoStarterNextRace = (jockey: string, racecard: Racecard): boolean => {
    if (racecard.race >= this.maxRace - 1) return false;
    if (this.isTrainerFinalRace(jockey, racecard)) return false;

    const next = racecard.race + 1;
    const trainer = getTrainer(jockey, racecard);

    return !this.racecards
      .find(r => r.race === next)
      ?.starters
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
      || this.isBoundaryPlayer(jockey, true)
      || this.rideThisRace(jockey, racecard)
      || this.rideThisRace(this.jockeys[this.jockeys.indexOf(jockey) + 1], racecard)
    )

  rideThisRace = (jockey: string, racecard: Racecard): boolean =>
    racecard.starters.map(s => s.jockey).includes(jockey)

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
      && (!race.name.includes('JUG'))
      && (!race.name.includes('CUP'))
      && (!race.name.includes('PLATE'))
      && (!race.name.includes('TROPHY'))
      && (!race.name.includes('CHALLENGE'))
      && (!race.name.includes('CHAMPIONSHIP'))
      && (
        race.grade.endsWith('3')
        || race.grade.endsWith('4')
        || race.grade.endsWith('5')
      )
    )

  isBoundaryPlayer = (player: string, jockey: boolean): boolean => {
    let specials = [];
    let players = jockey ? this.jockeys : this.trainers;
    let allPlayers = jockey ? this.allJockeys : this.allTrainers;
    let boundaryPlayers = jockey ? this.boundaryJockeys : this.boundaryTrainers;

    for (const p of boundaryPlayers) {
      if (players.includes(p)) {
        if (players.indexOf(p) !== players.length - 1) {
          specials.push(p);
        }
      } else {
        let priorIndex = allPlayers.indexOf(p);
        let priorPlayer = p;
        while (!players.includes(priorPlayer) && priorIndex > 0) {
          priorIndex -= 1;
          priorPlayer = allPlayers[priorIndex];
        }
        specials.push(priorPlayer);
      }
    }

    return specials.includes(player);
  }

  formatChallengeOdds = (odds: number): string => {
    if (odds < 1) return '';
    else if (odds > 99) return '99+';
    else return `${odds}`;
  }

  formatRaceGrade = (grade: string): string => {
    const clean = grade
      .replace('(', '')
      .replace(')', '')
      .replace('RESTRICTED', '')
      .replace('4 YEAR OLDS', '4Y')
      .replace('GRIFFIN RACE', 'GF')
      .replace('GRIFFIN', 'GF')
      .trim();
    return `${clean[0]}${clean.slice(-1)}`;
  }

  getRaceProgress = (card: Racecard): string => {
    if (!this.next) return '100%';
    if (this.next?.race < card.race) return '0%';
    if (this.next?.race > card.race + 1) return '100%';

    const currTime = new Date().getTime();
    const raceTime = new Date(card.time).getTime();
    const diff = Math.floor((raceTime - currTime) / 1000);
    if (diff >= 0) return '0%';

    const nextRaceTimeStr = this.racecards.find(r => r.race === card.race + 1)?.time || '';
    if (!nextRaceTimeStr) return '0%';

    const nextRaceTime = new Date(nextRaceTimeStr).getTime();
    if (currTime >= nextRaceTime) return '100%';

    const raceDiff = Math.floor((nextRaceTime - raceTime) / 1000);
    return `${Math.ceil(100 * Math.abs(diff) / raceDiff)}%`;
  }

  getStarterCount = (race: number): number =>
    (this.racecards.find(r => r.race === race)?.starters || [])
      .filter(s => !s.scratched).length

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

  getInvestmentPoolAmount = (race: number, pool: string): string => {
    let amount = this.investmentPools
      .find(i => i.race === race && i.pool === pool)?.amount || '';

    if (amount === '0.00') return '';
    if (amount.startsWith('0.')) {
      amount = amount.replace('0.', ' .');
      if (amount.includes('.0')) {
        amount = amount.replace('.0', '. ');
      }
    }
    if (amount.endsWith('0')) {
      amount = `${amount.slice(0, amount.length - 1)} `;
    }
    return amount;
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

    let track = racecard.track.toUpperCase();
    if (track !== 'TURF') track = 'AWT';
    const trackColor = track === 'TURF' ? 'text-green-600' : 'text-orange-400';

    const time = formatRaceTime(racecard.time);
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
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[0].odds.toFixed(1))
        case 'QPL-2':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[1].odds.toFixed(1))
        case 'QPL-3':
          return parseFloat((d?.quinellaPlace || DEFAULT_COMBINATIONS)[2].odds.toFixed(1))

        case 'DBL-1':
          return Math.floor((d?.doubles || DEFAULT_COMBINATIONS)[0].odds)
        case 'DBL-2':
          return (d?.doubles || DEFAULT_COMBINATIONS)[1].odds

        case 'TBL-1':
          return Math.floor((d?.treble || DEFAULT_COMBINATIONS)[0].odds)
        case 'TBL-2':
          return Math.floor((d?.treble || DEFAULT_COMBINATIONS)[1].odds)

        case '6UP-1':
          return Math.floor((d?.sixUp || DEFAULT_COMBINATIONS)[0].odds)
        case '6UP-2':
          return Math.floor((d?.sixUp || DEFAULT_COMBINATIONS)[1].odds)

        case 'D-T':
          return Math.floor((d?.doubleTrio || DEFAULT_COMBINATIONS)[0].odds)
        case 'TT-1':
          return Math.floor((d?.tripleTrio || DEFAULT_COMBINATIONS)[0].odds)
        case 'TT-2':
          return Math.floor((d?.tripleTrio || DEFAULT_COMBINATIONS)[1].odds)

        default:
          return 0
      }
    } catch (e) {
      return 0;
    }
  }

  getDividendTop4 = (race: number): string[] => {
    const starters = this.racecards
        .find(r => r.race === race)
        ?.starters
        .filter(s => (s?.placing || 0) >= 1 && (s?.placing || 0) <= 4)
        .sort((s1, s2) => (s1.placing - s2.placing) || (s1.order - s2.order))
      || [];

    if (starters.length === 0) return [];

    return Array(4).fill(1)
      .map((_, index) => 1 + index)
      .map(p => starters
        .filter(s => s.placing === p)
        .map(s => s.order)
        .join('/'));
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

  getOutsiderChallengerInvestment = (personType: string): number => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => o.outsider)
      .map(o => this.getChallengerInvestment(o.challenger))
      .reduce((prev, curr) => prev + curr, 0);
  }

  getArbitrageBet = (personType: string): number[] => {
    const beps = this.getActiveChallengerBreakEvenPercentageSum(personType);
    if (beps <= 0 || beps >= 1) return [0, 0];

    const odds = this.racecards.find(r => r.race === 1)?.odds;
    const oddsList = (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => this.activeChallengers.has(o.challenger))
      ?.map(o => o.odds) || [];

    if (oddsList.length === 1) return [10, oddsList[0] - 1];
    const minEachCredit = 10 * (oddsList.sort((o1, o2) => o2 - o1)[0] || 1);

    const minTotalDebit = oddsList
      .map(o => {
        let wager = Math.floor(minEachCredit / o);
        while (wager % 10 !== 0) wager++;
        return wager;
      })
      .reduce((prev, curr) => prev + curr, 0);

    return [
      minTotalDebit,
      minEachCredit / minTotalDebit - 1
    ];
  }

  getActiveChallengerBreakEvenPercentageSum = (personType: string): number => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => this.activeChallengers.has(o.challenger))
      ?.map(o => 1 / o.odds)
      .reduce((prev, curr) => prev + curr, 0);
  }

  getChallengeBreakEvenPercentageSum = (personType: string): number => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.map(o => 1 / o.odds)
      .reduce((prev, curr) => prev + curr, 0);
  }

  getChallengeOdds = (personType: string, order: number): ChallengeOdds => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return DEFAULT_CHALLENGE_ODDS;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => !o.outsider)
      ?.find(o => o.order === order) || DEFAULT_CHALLENGE_ODDS;
  }

  getOutsiderChallengeOdds = (personType: string): ChallengeOdds => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return DEFAULT_CHALLENGE_ODDS;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.find(o => o.outsider) || DEFAULT_CHALLENGE_ODDS;
  }

  isTopChallengePoint = (personType: string, order: number): boolean => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return false;
    return (personType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => o.points > 0)
      .map(o => o.points)
      .filter((p, index, arr) => index === arr.indexOf(p))
      .sort((p1, p2) => p2 - p1)
      .slice(0, 3)
      .includes(this.getChallengeOdds(personType, order).points);
  }

  getCrossRacePoolDividendRaces = (row: number): number => {
    if (this.crossRacePoolDividendRaces.length >= row) {
      return this.crossRacePoolDividendRaces[row - 1];
    }
    return 1;
  }

  get todayTurnover(): number {
    return this.racecards
      .filter(r => (r?.pool?.meetingTotal || 0) > 0)
      .map(r => r.pool.meetingTotal)
      .sort((t1, t2) => t2 - t1)
      .shift() || 0;
  }

  get dividendRacePools(): PoolThreshold[] {
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
      {name: 'QPL-1', threshold: 15},
      {name: 'QPL-2', threshold: 15},
      {name: 'QPL-3', threshold: 15},
      {name: 'DBL-1', threshold: 50},
      {name: 'DBL-2', threshold: 20},
    ];
  }

  get dividendCrossRacePools(): PoolThreshold[] {
    return [
      {name: 'TBL-1', threshold: 100},
      {name: 'TBL-2', threshold: 40},
      {name: '6UP-1', threshold: 300},
      {name: '6UP-2', threshold: 3000},
      {name: 'D-T', threshold: 3000},
      {name: 'TT-1', threshold: 10000},
      {name: 'TT-2', threshold: 1000},
    ];
  }

  get crossRacePoolDividendRaces(): number[] {
    let races = this.racecards
      .filter(r =>
        r?.dividend?.treble
        ||
        r?.dividend?.sixUp
        ||
        r?.dividend?.doubleTrio
        ||
        r?.dividend?.tripleTrio
      )
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2);

    while (races.length < 5) races.push(1);
    return races;
  }

  get investmentPoolNames(): string[] {
    return this.investmentPools
      .map(p => p.pool)
      .filter((p, index, arr) => index === arr.indexOf(p));
  }

  get investmentPools(): InvestmentPool[] {
    return this.racecards.flatMap(r => {
      const pool = r?.pool;
      return [
        {race: r.race, pool: 'WIN', amount: toMillion(pool?.win || 0)},
        {race: r.race, pool: 'PLA', amount: toMillion(pool?.place || 0)},
        {race: r.race, pool: 'QIN', amount: toMillion(pool?.quinella || 0)},
        {race: r.race, pool: 'QPL', amount: toMillion(pool?.quinellaPlace || 0)},
        {race: r.race, pool: 'FCT', amount: toMillion(pool?.forecast || 0)},
        {race: r.race, pool: 'TRI', amount: toMillion(pool?.trio || 0)},
        {race: r.race, pool: 'TCE', amount: toMillion(pool?.tierce || 0)},
        {race: r.race, pool: 'F-Q', amount: toMillion(pool?.quartet || 0)},
        {race: r.race, pool: 'DBL', amount: toMillion(pool?.doubles || 0)},
        {race: r.race, pool: 'TBL', amount: toMillion(pool?.treble || 0)},
        {race: r.race, pool: '6UP', amount: toMillion(pool?.sixUp || 0)},
        {race: r.race, pool: 'D-T', amount: toMillion(pool?.doubleTrio || 0)},
        {race: r.race, pool: 'T-T', amount: toMillion(pool?.tripleTrio || 0)},
      ];
    });
  }

  get summaryLines(): string[] {
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

  get maxChallengerOrder(): number {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return [...odds?.jkc, ...odds?.tnc]
      .filter(o => !o.outsider)
      .map(o => o.order)
      .sort((o1, o2) => o1 - o2)
      .pop() || 0;
  }

  get starters(): Starter[] {
    return this.racecards.flatMap(r => r.starters);
  }

  get jockeys(): string[] {
    const meetingJockeys = new Set(this.starters.map(s => s.jockey));
    return this.allJockeys.filter(j => meetingJockeys.has(j));
  }

  get trainers(): string[] {
    const meetingTrainers = new Set(this.starters.map(s => s.trainer));
    return this.allTrainers.filter(t => meetingTrainers.has(t));
  }

  get boundaryJockeys(): string[] {
    return this.players.filter(p => p.jockey && p.boundary).map(j => j.code);
  }

  get boundaryTrainers(): string[] {
    return this.players.filter(p => !p.jockey && p.boundary).map(j => j.code);
  }

  get allJockeys(): string[] {
    return this.players.filter(p => p.jockey).map(j => j.code);
  }

  get allTrainers(): string[] {
    return this.players.filter(p => !p.jockey).map(j => j.code);
  }

  get players(): Player[] {
    return this.repo.findPlayers();
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
    return this.racecards.filter(r => !r.dividend?.win)[0];
  }

  get isLoading(): boolean {
    return this.pick.races.length === 0
      || this.meeting.players.length === 0
      || this.racecards.length === 0
      || this.repo.findPlayers().length === 0
      || this.repo.findHorses().length === 0;
  }
}
