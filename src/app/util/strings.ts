import {JOCKEYS} from '../model/person.model';

export interface PlacingMap {
  placing: string,
  color: string
}

export interface OddsIntensity {
  category: string,
  color: string
  lower: number
  upper: number
}

export interface RatingFactorMap {
  order: number,
  factor: string,
  abbreviation: string
}

export interface Season {
  label: string,
  opening: string,
  finale: string
}

export const RATING_GRADES = [
  'A', 'B', 'C', 'D',
]

export const COMMON_HORSE_ORIGINS = [
  'AUS', 'NZ', 'IRE'
];

export const COLORS = [
  'text-red-600',
  'text-green-600',
  'text-blue-600',
  'text-purple-600',
];

export const SEASONS: Season[] = [
  {label: '23/24', opening: '2023-09-10', finale: '2024-07-14'},
  {label: '22/23', opening: '2022-09-11', finale: '2023-07-16'},
]

export const PLACING_MAPS: PlacingMap[] = [
  {placing: 'W', color: 'text-red-600'},
  {placing: 'Q', color: 'text-green-600'},
  {placing: 'P', color: 'text-blue-600'},
  {placing: 'F', color: 'text-purple-600'}
];

export const ODDS_INTENSITIES: OddsIntensity[] = [
  {category: 'favorite', color: 'text-red-600', lower: 1.0, upper: 3.9},
  {category: 'superior', color: 'text-green-600', lower: 4.0, upper: 9.9},
  {category: 'inferior', color: 'text-blue-600', lower: 10.0, upper: 19.9},
  {category: 'unwanted', color: 'text-purple-600', lower: 20.0, upper: 999.0},
];

export const RATING_FACTOR_MAPS: RatingFactorMap[] = [
  {order: 1, factor: 'familiarity', abbreviation: 'FAM'},
  {order: 2, factor: 'collaboration', abbreviation: 'COL'},
  {order: 3, factor: 'individualContinuity', abbreviation: 'IC'},
  {order: 4, factor: 'collaboratedContinuity', abbreviation: 'CC'},
  {order: 5, factor: 'dueAcquisition', abbreviation: 'DA'},
  {order: 6, factor: 'dueCollaboration', abbreviation: 'DC'},
  {order: 7, factor: 'individualLookAhead', abbreviation: 'ILA'},
  {order: 8, factor: 'collaboratedLookAhead', abbreviation: 'CLA'},
  {order: 9, factor: 'horseAbsorption', abbreviation: 'HA'},
  {order: 10, factor: 'individualAbsorption', abbreviation: 'IA'},
  {order: 11, factor: 'horseOwner', abbreviation: 'HO'},
  {order: 12, factor: 'occasion', abbreviation: 'OCC'},
];

export const JOCKEY_CODES = JOCKEYS.map(j => j.code);

export const BOUNDARY_JOCKEYS = [
  'AVB', 'DMK', 'HAA', 'YML',
];

export const BOUNDARY_TRAINERS = [
  'HDA', 'SCS', 'NM',
];

export const BOUNDARY_PERSONS =
  BOUNDARY_JOCKEYS.concat(BOUNDARY_TRAINERS);

export const BOUNDARY_POOLS = [
  'F-F', 'QTT', 'PLA-3', 'QPL-3'
];