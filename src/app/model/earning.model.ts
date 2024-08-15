export interface AccumulatedSeasonEarning {
  season: string,
  players: AccumulatedPlayerEarning[]
}

export interface AccumulatedPlayerEarning {
  player: string,
  meetings: AccumulatedPlayerMeetingEarning[]
}

export interface AccumulatedPlayerMeetingEarning {
  upToMeeting: string,
  meetingOrdinal: number,
  earnings: number,
  enhancedEarnings: number
}
