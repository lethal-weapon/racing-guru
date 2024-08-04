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

export interface Season {
  label: string,
  opening: string,
  finale: string
}

export const BOUNDARY_POOLS = [
  'F-F', 'QTT', 'PLA-3', 'QPL-3', 'TBL-2', '6UP-2', 'D-T', 'TT-2',
]

export const RATING_GRADES = [
  'A', 'B', 'C', 'D',
]

export const COMMON_HORSE_ORIGINS = [
  'AUS', 'NZ', 'IRE',
]

export const LICENCES = [
  'Club', 'Freelance',
]

export const NATIONALITIES = [
  'HK', 'AUS', 'NZ', 'SAF', 'MAU', 'BRZ', 'JPN',
  'GB', 'FR', 'ITY', 'IRE', 'GER', 'DEN', 'BEL',
]

export const COLORS = [
  'text-red-600',
  'text-green-600',
  'text-blue-600',
  'text-purple-600',
]

export const SEASONS: Season[] = [
  {label: '24/25', opening: '2024-09-08', finale: '2025-07-16'},
  {label: '23/24', opening: '2023-09-10', finale: '2024-07-14'},
  {label: '22/23', opening: '2022-09-11', finale: '2023-07-16'},
]

export const PLACING_MAPS: PlacingMap[] = [
  {placing: 'W', color: 'text-red-600'},
  {placing: 'Q', color: 'text-green-600'},
  {placing: 'P', color: 'text-blue-600'},
  {placing: 'F', color: 'text-purple-600'},
]

export const ODDS_INTENSITIES: OddsIntensity[] = [
  {category: 'favorite', color: 'text-red-600', lower: 1.0, upper: 3.9},
  {category: 'superior', color: 'text-green-600', lower: 4.0, upper: 9.9},
  {category: 'inferior', color: 'text-blue-600', lower: 10.0, upper: 19.9},
  {category: 'unwanted', color: 'text-purple-600', lower: 20.0, upper: 999.0},
]
