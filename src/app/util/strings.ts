import {JOCKEYS} from '../model/person.model';

export interface PlacingMap {
  placing: string,
  color: string
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

export const JOCKEY_CODES = JOCKEYS.map(j => j.code);

export const BOUNDARY_JOCKEYS = [
  'BA', 'YML', 'CLR'
];

export const BOUNDARY_TRAINERS = [
  'HAD', 'YTP', 'TKH'
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