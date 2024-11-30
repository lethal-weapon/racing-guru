import {Starter} from '../model/starter.model';
import {Racecard} from '../model/racecard.model';
import {WinPlaceOdds} from '../model/odds.model';
import {CombinationSignal, SingularSignal} from '../model/signal.model';
import {COLORS, ODDS_INTENSITIES} from './strings';
import {FCT_PAYOUT_RATE, ONE_MILLION, PAYOUT_RATE, REST_PAYOUT_RATE, TRI_PAYOUT_RATE} from './numbers';
import {Meeting} from '../model/meeting.model';

export const formatRace = (race: number): string =>
  race === 10 ? 'X' : race === 11 ? 'E' : race.toString()

export const formatOdds = (odds: number): string =>
  odds < 10 ? odds.toFixed(1) : Math.floor(odds).toString()

export const formatMeeting = (meeting: string): string =>
  meeting.replace(/^\d{4}-/g, '')

export const formatRaceTime = (raceTime: string): string => {
  const dt = new Date(raceTime);
  let time = `${dt.getHours()} : ${dt.getMinutes()}`;

  if (dt.getMinutes() === 0) time += '0';
  else if (dt.getMinutes() < 10) {
    time = `${dt.getHours()} : 0${dt.getMinutes()}`;
  }
  return time;
}

export const formatRaceTimeWithoutSpace = (raceTime: string): string =>
  formatRaceTime(raceTime).replace(/\s/g, '')

export const toMillion = (amount: number): string =>
  (amount / ONE_MILLION).toFixed(2)

export const toHorseProfileUrl = (brand: string): string =>
  `https://racing.hkjc.com/racing/information/English/Horse/Horse.aspx?HorseNo=${brand}`

export const toOrdinalWithSuffix = (ordinal: number): string => {
  let suffix = 'th';
  if (ordinal % 10 === 1 && !ordinal.toString().endsWith('11')) suffix = 'st';
  else if (ordinal % 10 === 2) suffix = 'nd';
  else if (ordinal % 10 === 3) suffix = 'rd';

  return `${ordinal}${suffix}`;
}

export const toRelativeTime = (raceTime: Date, detectedAt: string): string => {
  const spotTime = new Date(detectedAt);
  const diff = Math.floor((raceTime.getTime() - spotTime.getTime()) / 1000);

  const totalSeconds = Math.abs(diff);
  if (diff <= 0) return `+${totalSeconds}S`;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}H`;
  if (minutes > 0) return `${minutes}M`;
  return `${seconds}S`;
}

export const isBoundaryMeeting = (meetings: Meeting[], meeting: string): boolean =>
  meetings
    .map(m => m.meeting.slice(0, 7))
    .filter((prefix, i, array) => array.indexOf(prefix) === i)
    .map(prefix => meetings
      .map(m => m.meeting)
      .filter(m => m.startsWith(prefix))
      .sort((m1, m2) => m1.localeCompare(m2))
      .shift()
    )
    .includes(meeting)

export const getMaxRace = (racecards: Racecard[]): number =>
  racecards.map(r => r.race).pop() || 0

export const getStarter = (jockey: string, racecard: Racecard): Starter => {
  // @ts-ignore
  return racecard.starters.find(s => s.jockey === jockey);
}

export const getTrainer = (jockey: string, racecard: Racecard): string =>
  getStarter(jockey, racecard)?.trainer || '?';

export const getStarters = (racecard: Racecard): Starter[] => {
  if (!racecard) return [];

  return racecard.starters.filter(s => !s.scratched).sort((s1, s2) => {
    const odds1 = getWinPlaceOdds(s1.jockey, racecard);
    const odds2 = getWinPlaceOdds(s2.jockey, racecard);

    return (odds1.win - odds2.win) || (odds1.place - odds2.place) || (s1.order - s2.order);
  });
}

export const getWinPlaceOdds = (jockey: string, racecard: Racecard): WinPlaceOdds => {
  const order = getStarter(jockey, racecard)?.order || 0;
  const defaultValue = {order: order, win: 0, place: 0};

  if (!racecard.odds) return defaultValue;

  return racecard.odds.winPlace
    .find(o => o.order === order) || defaultValue;
}

export const getStarterWinPlaceOdds = (starter: Starter, racecard: Racecard): WinPlaceOdds => {
  if (!racecard) return {order: starter.order, win: 0, place: 0};
  return getWinPlaceOdds(starter.jockey, racecard);
}

export const getStarterQQPWinPlaceOdds = (starter: Starter, racecard: Racecard): number[] => {
  const qin = racecard?.odds?.quinella;
  const qpl = racecard?.odds?.quinellaPlace;

  return [qin, qpl].map((pairs, index) => {
    if (!pairs) return 1;
    const factor = index === 0 ? 2 : 6;

    return factor * PAYOUT_RATE / pairs
      .filter(p => p.orders.includes(starter.order))
      .map(p => PAYOUT_RATE / p.odds)
      .reduce((prev, curr) => prev + curr, 0);
  });
}

export const getTrioFirstFourOdds = (starter: Starter, racecard: Racecard): number[] => {
  const tri = racecard?.odds?.trio;
  const ff = racecard?.odds?.firstFour;

  return [tri, ff].map((combs, index) => {
    if (!combs) return 1;

    const factor = index === 0 ? 3 : 4;
    const payoutRate = index === 0 ? TRI_PAYOUT_RATE : REST_PAYOUT_RATE;

    return factor * payoutRate / combs
      .filter(p => p.orders.includes(starter.order))
      .map(p => payoutRate / p.odds)
      .reduce((prev, curr) => prev + curr, 0);
  });
}

export const getForecastPlacingOdds = (starter: Starter, placing: number, racecard: Racecard): number => {
  const pairs = racecard?.odds?.forecast || [];
  if (pairs.length === 0) return 1;

  return FCT_PAYOUT_RATE / pairs
    .filter(c =>
      placing === 1
        ? c.orders[0] === starter.order
        : c.orders[1] === starter.order
    )
    .map(c => FCT_PAYOUT_RATE / c.odds)
    .reduce((prev, curr) => prev + curr, 0);
}

export const getTiercePlacingOdds = (starter: Starter, placing: number, racecard: Racecard): number => {
  const investments = racecard?.odds?.tierce || [];
  if (investments.length === 0) return 1;

  const totalInvestment = investments
    .map(i => i.win + i.second + i.third)
    .reduce((prev, curr) => prev + curr, 0);

  const netPool = totalInvestment * REST_PAYOUT_RATE;
  const starterInvestment = investments.find(i => i.order === starter.order);
  if (!starterInvestment) return 1;

  const starterPlacingInvestment = placing === 1
    ? starterInvestment.win
    : (placing === 2 ? starterInvestment.second : starterInvestment.third);

  return netPool / starterPlacingInvestment;
}

export const getDoublePlacingOdds = (starter: Starter, placing: number, racecard: Racecard): number => {
  // placing === 1 means 2nd leg of previous race
  // placing === 2 means 1st leg of this race
  if (!racecard) return 1;

  const pairs = racecard?.odds?.doubles || [];
  if (pairs.length === 0) return 1;

  return PAYOUT_RATE / pairs
    .filter(c =>
      placing === 1
        ? c.orders[1] === starter.order
        : c.orders[0] === starter.order
    )
    .map(c => PAYOUT_RATE / c.odds)
    .reduce((prev, curr) => prev + curr, 0);
}

export const getSignalColor = (signals: SingularSignal[] | CombinationSignal[]): string =>
  signals.length > 1 ? COLORS[0] : COLORS[1];

export const toPlacingColor = (placing: number | undefined): string =>
  (placing && placing >= 1 && placing <= 4) ? COLORS[placing - 1] : ''

export const getOddsIntensityColor = (odds: number): string =>
  ODDS_INTENSITIES.find(oi => odds >= oi.lower && odds <= oi.upper)?.color || ''

export const getPlacingBorderBackground = (starter: Starter): string => {
  let placing = starter?.placing || 0;
  if (!(placing >= 1 && placing <= 4)) placing = 0;
  return [
    'border border-gray-700',
    'bg-red-800', 'bg-green-800',
    'bg-blue-800', 'bg-purple-800',
  ][placing];
}

export const getRaceBadgeStyle = (activeRace: number, renderRace: number): string =>
  activeRace === renderRace
    ? `text-yellow-400 border-yellow-400`
    : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

export const powerSet = (list: string[]): string[][] => {
  const listSize = list.length;
  const combinationsCount = (1 << listSize);
  let set: Set<string[]> = new Set();

  for (let i = 1; i < combinationsCount; i++) {
    let combination: string[] = [];

    for (let j = 0; j < listSize; j++) {
      if ((i & (1 << j))) {
        combination.push(list[j]);
      }
    }

    set.add(combination);
  }

  return Array.from(set);
}
