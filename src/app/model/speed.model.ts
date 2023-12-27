export interface MeetingSpeedFigure {
  meeting: string,
  figure: number
}

export interface SpeedFigure {
  horse: string,
  figures: MeetingSpeedFigure[]
}

export const DEFAULT_SPEED_FIGURE: SpeedFigure = {
  horse: '',
  figures: []
}