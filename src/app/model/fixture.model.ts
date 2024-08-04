export interface Fixture {
  season: string,
  meetings: MeetingFixture[]
}

export interface MeetingFixture {
  meeting: string,
  venue: string,
  hour: string
}
