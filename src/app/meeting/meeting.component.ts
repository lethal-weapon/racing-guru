import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {WebsocketService} from '../websocket.service';
import {RestRepository} from '../model/rest.repository';
import {DEFAULT_PICK, Pick} from '../model/pick.model';
import {Player} from '../model/player.model';
import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {DEFAULT_MEETING, Meeting} from '../model/meeting.model';
import {ChallengeOdds, DEFAULT_CHALLENGE_ODDS} from '../model/odds.model';
import {LATEST} from '../util/strings';
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

interface ChallengeArbitrageBet {
  minTotalDebit: number,
  expectedRoi: number,
  betline: string
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

  protected readonly EARNING_THRESHOLD = EARNING_THRESHOLD;
  protected readonly formatRace = formatRace;
  protected readonly formatRaceTimeWithoutSpace = formatRaceTimeWithoutSpace;
  protected readonly toHorseProfileUrl = toHorseProfileUrl;
  protected readonly getStarter = getStarter;
  protected readonly getTrainer = getTrainer;
  protected readonly getWinPlaceOdds = getWinPlaceOdds;

  constructor(
    private repo: RestRepository,
    private socket: WebsocketService,
    private clipboard: Clipboard
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
    const meeting = LATEST;

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

  getStarterPlacingColor = (jockey: string, card: Racecard): string =>
    toPlacingColor(getStarter(jockey, card)?.placing)

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

  getOutsiderChallengerInvestment = (playerType: string): number => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return (playerType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => o.outsider)
      .map(o => this.getChallengerInvestment(o.challenger))
      .reduce((prev, curr) => prev + curr, 0);
  }

  copyArbitrageBetline = (playerType: string) =>
    this.clipboard.copy(this.getArbitrageBet(playerType).betline)

  getArbitrageBet = (playerType: string): ChallengeArbitrageBet => {
    const beps = this.getActiveChallengerBreakEvenPercentageSum(playerType);
    if (beps <= 0 || beps >= 1) return {minTotalDebit: 0, expectedRoi: 0, betline: ''};

    const betlinePool = playerType === 'Jockey' ? 'jkc' : 'tnc';
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    const oddsList = (playerType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => this.activeChallengers.has(o.challenger)) || [];

    if (oddsList.length === 1) {
      return {
        minTotalDebit: 10,
        expectedRoi: oddsList[0].odds - 1,
        betline: `${betlinePool}:${oddsList[0].order}`
      };
    }

    const minEachCredit = 10 * (oddsList.sort((o1, o2) => o2.odds - o1.odds)[0].odds || 1);
    const oddsWagerList = oddsList.map(o => {
      let wager = Math.floor(minEachCredit / o.odds);
      while (wager % 10 !== 0) wager++;
      return {...o, wager: wager};
    });

    const minTotalDebit = oddsWagerList
      .map(ow => ow.wager)
      .reduce((prev, curr) => prev + curr, 0);

    const roiSum = oddsWagerList
      .map(ow => ow.wager * ow.odds / minTotalDebit - 1)
      .reduce((prev, curr) => prev + curr, 0);

    const betline = oddsWagerList
      .sort((ow1, ow2) => ow1.order - ow2.order)
      .map(ow => `${betlinePool}:${ow.order}/$${ow.wager}`)
      .join(';');

    return {
      minTotalDebit: minTotalDebit,
      expectedRoi: roiSum / oddsWagerList.length,
      betline: betline
    };
  }

  getActiveChallengerBreakEvenPercentageSum = (playerType: string): number => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return (playerType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => this.activeChallengers.has(o.challenger))
      ?.map(o => 1 / o.odds)
      .reduce((prev, curr) => prev + curr, 0);
  }

  getChallengeBreakEvenPercentageSum = (playerType: string): number => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return 0;
    return (playerType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.map(o => 1 / o.odds)
      .reduce((prev, curr) => prev + curr, 0);
  }

  getChallengeOdds = (playerType: string, order: number): ChallengeOdds => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return DEFAULT_CHALLENGE_ODDS;
    return (playerType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => !o.outsider)
      ?.find(o => o.order === order) || DEFAULT_CHALLENGE_ODDS;
  }

  getOutsiderChallengeOdds = (playerType: string): ChallengeOdds => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return DEFAULT_CHALLENGE_ODDS;
    return (playerType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.find(o => o.outsider) || DEFAULT_CHALLENGE_ODDS;
  }

  isTopChallengePoint = (playerType: string, order: number): boolean => {
    const odds = this.racecards.find(r => r.race === 1)?.odds;
    if (!odds?.jkc || !odds?.tnc) return false;
    return (playerType === 'Jockey' ? odds?.jkc : odds?.tnc)
      ?.filter(o => o.points > 0)
      .map(o => o.points)
      .filter((p, index, arr) => index === arr.indexOf(p))
      .sort((p1, p2) => p2 - p1)
      .slice(0, 3)
      .includes(this.getChallengeOdds(playerType, order).points);
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
