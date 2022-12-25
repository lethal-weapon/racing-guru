export interface RaceHorse {
  meeting      : string,
  trainer      : string,
  horse        : string,
  horseNameEN  : string,
  horseNameCH  : string,
  race        ?: number,
  order       ?: number,
  placing     ?: number,
  winOdds     ?: number
}