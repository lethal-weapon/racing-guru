import {JOCKEYS} from '../model/person.model';

export const COMMON_HORSE_ORIGINS = [
  'AUS', 'NZ', 'IRE'
];

export const COLORS = [
  'text-red-600',
  'text-green-600',
  'text-blue-600',
  'text-purple-600',
];

export const JOCKEY_CODES = JOCKEYS.map(j => j.code);

export const BOUNDARY_JOCKEYS = [
  'BA', 'YML', 'CLR'
];

export const BOUNDARY_TRAINERS = [
  'HAD', 'SWY', 'YTP'
];

export const BOUNDARY_PERSONS =
  BOUNDARY_JOCKEYS.concat(BOUNDARY_TRAINERS);
