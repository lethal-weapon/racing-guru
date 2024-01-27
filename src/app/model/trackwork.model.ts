export interface TrackworkGrade {
  race: number,
  order: number,
  horse: string,
  grade: string
  trainer: string,
  trainerFocus: boolean
}

export const DEFAULT_TRACKWORK_GRADE: TrackworkGrade = {
  race: 0,
  order: 0,
  horse: '',
  grade: '',
  trainer: '',
  trainerFocus: false
}