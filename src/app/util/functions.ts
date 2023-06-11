import {ONE_MILLION, PAYOUT_RATE, FCT_TRI_PAYOUT_RATE} from './numbers';
import {JOCKEY_CODES} from './strings';
import {COLORS} from './strings';
import {Racecard} from '../model/racecard.model';
import {WinPlaceOdds} from '../model/odds.model';
import {Starter} from '../model/starter.model';
import {Relationship, RELATIONSHIPS} from '../model/relationship.model';

export const toMillion = (amount: number): string =>
  (amount / ONE_MILLION).toFixed(2)

export const isFavorite = (starter: Starter, racecard: Racecard): boolean =>
  racecard.favorites.includes(starter.order)

export const getNewFavorites = (starter: Starter, racecard: Racecard): number[] => {
  const order = starter.order;
  let favorites = racecard.favorites.map(f => f);

  if (favorites.includes(order)) favorites = favorites.filter(f => f !== order);
  else favorites.push(order);

  return favorites;
}

export const getHorseProfileUrl = (brand: string): string => {
  return `
        https://racing.hkjc.com/racing/information/
        English/Horse/Horse.aspx?HorseNo=${brand}
    `.replace(/\s/g, '');
}

export const getCurrentMeeting = (racecards: Racecard[]): string =>
  racecards.find(r => r.race === 1)?.meeting || '---'

export const getMaxRace = (racecards: Racecard[]): number =>
  racecards.map(r => r.race).pop() || 0

export const getStarter = (jockey: string, racecard: Racecard): Starter => {
  // @ts-ignore
  return racecard.starters.find(s => s.jockey === jockey);
}

export const getStarters = (racecard: Racecard): Starter[] => {
  if (!racecard) return [];

  return racecard.starters.filter(s => !s.scratched).sort((s1, s2) => {
    const odds1 = getWinPlaceOdds(s1.jockey, racecard);
    const odds2 = getWinPlaceOdds(s2.jockey, racecard);

    return odds1.win - odds2.win
      || odds1.place - odds2.place
      || JOCKEY_CODES.indexOf(s1.jockey) - JOCKEY_CODES.indexOf(s2.jockey);
  });
}

export const getTrainer = (jockey: string, racecard: Racecard): string =>
  getStarter(jockey, racecard).trainer;

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

  return [qin, qpl].map(pairs => {
    if (!pairs) return 1;

    return 2 * PAYOUT_RATE / pairs
      .filter(p => p.orders.includes(starter.order))
      .map(p => PAYOUT_RATE / p.odds)
      .reduce((prev, curr) => prev + curr, 0);
  });
}

export const getStarterFCTWQOdds = (starter: Starter, racecard: Racecard): number[] => {
  const fct = racecard?.odds?.forecast;

  return [fct, fct].map((pairs, index) => {
    if (!pairs) return 1;

    return 2 * FCT_TRI_PAYOUT_RATE / pairs
      .filter(p => p.orders[index] === starter.order)
      .map(p => FCT_TRI_PAYOUT_RATE / p.odds)
      .reduce((prev, curr) => prev + curr, 0);
  });
}

export const getStarterDBLWinOdds = (
  starter: Starter,
  racecard: Racecard,
  prevRacecard: Racecard
): number[] => {

  const dbl = racecard?.odds?.double;
  const prevDBL = prevRacecard?.odds?.double;

  return [dbl, prevDBL].map((pairs, index) => {
    if (!pairs) return 1;

    return PAYOUT_RATE / pairs
      .filter(p => p.orders[index] === starter.order)
      .map(p => PAYOUT_RATE / p.odds)
      .reduce((prev, curr) => prev + curr, 0);
  });
}

export const getPlacing = (jockey: string, racecard: Racecard): number => {
  const tierce = racecard?.dividend?.tierce;
  const quartet = racecard?.dividend?.quartet;
  if (!tierce) return 0;

  let orders = tierce[0].orders;
  if (quartet) orders = quartet[0].orders;

  const order = getStarter(jockey, racecard)?.order;
  if (!orders.includes(order)) return 0;
  return orders.indexOf(order) + 1;
}

export const getPlacingColor = (jockey: string, racecard: Racecard): string => {
  const placing = getPlacing(jockey, racecard);
  return placing > 0 ? COLORS[placing - 1] : '';
}

export const getPlacingBorderBackground = (jockey: string, racecard: Racecard): string =>
  [
    'border border-gray-700',
    'bg-red-800', 'bg-green-800',
    'bg-blue-800', 'bg-purple-800',
  ][getPlacing(jockey, racecard)]

export const getRaceBadgeStyle = (activeRace: number, renderRace: number): string =>
  activeRace === renderRace
    ? `text-yellow-400 border-yellow-400`
    : `border-gray-600 hover:border-yellow-400 hvr-float-shadow cursor-pointer`

export const findRelationship = (personA: string, personB: string): Relationship =>
  RELATIONSHIPS.find(r =>
    (r.personA === personA && r.personB === personB) ||
    (r.personA === personB && r.personB === personA)
  )
  || {personA: personA, personB: personB, weight: 0}
