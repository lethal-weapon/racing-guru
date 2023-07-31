import {JOCKEYS} from '../model/person.model';

export interface PlacingMap {
  placing: string,
  color: string
}

export interface RatingFactorMap {
  order: number,
  factor: string,
  abbreviation: string
}

export const COMMON_HORSE_ORIGINS = [
  'AUS', 'NZ', 'IRE'
];

export const COLORS = [
  'text-red-600',
  'text-green-600',
  'text-blue-600',
  'text-purple-600',
];

export const PLACING_MAPS: PlacingMap[] = [
  {placing: 'W', color: 'text-red-600'},
  {placing: 'Q', color: 'text-green-600'},
  {placing: 'P', color: 'text-blue-600'},
  {placing: 'F', color: 'text-purple-600'}
];

export const RATING_FACTOR_MAPS: RatingFactorMap[] = [
  {order: 1, factor: 'familiarity', abbreviation: ''},
  {order: 2, factor: 'collaboration', abbreviation: ''},
  {order: 3, factor: 'dueCollaboration', abbreviation: ''},
  {order: 4, factor: 'dueAcquisition', abbreviation: ''},
  {order: 5, factor: 'individualContinuity', abbreviation: ''},
  {order: 6, factor: 'individualLookAhead', abbreviation: ''},
  {order: 7, factor: 'individualAbsorption', abbreviation: ''},
  {order: 8, factor: 'collaboratedContinuity', abbreviation: ''},
  {order: 9, factor: 'collaboratedLookAhead', abbreviation: ''},
  {order: 10, factor: 'horseAbsorption', abbreviation: ''},
  {order: 11, factor: 'horseOwner', abbreviation: ''},
  {order: 12, factor: 'occasion', abbreviation: ''},
];

export const JOCKEY_CODES = JOCKEYS.map(j => j.code);

export const BOUNDARY_JOCKEYS = [
  'CLR', 'DMK', 'AA', 'YML'
];

export const BOUNDARY_TRAINERS = [
  'HDA', 'YTP', 'TKH'
];

export const BOUNDARY_PERSONS =
  BOUNDARY_JOCKEYS.concat(BOUNDARY_TRAINERS);

export const BOUNDARY_POOLS = [
  'F-F', 'QTT', 'PLA-3', 'QPL-3'
];

export const BOUNDARY_MEETINGS = [
  '2023-07-01',
  '2023-06-04',
  '2023-05-03',
  '2023-04-02',
  '2023-03-01',
  '2023-02-01',
  '2023-01-01',
  '2022-12-04',
  '2022-11-06',
  '2022-10-01',
];