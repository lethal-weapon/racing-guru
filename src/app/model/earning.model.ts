export interface SeasonEarning {
  season   : string,
  start    : string,
  end      : string,
  earnings : Earning[]
}

export interface Earning {
  person       : string,
  engageDays   : number,
  earnDays     : number,
  totalEarn    : number,
  earnDayAvg   : number,
  engageDayAvg : number,
  avgAvg       : number,
  poor         : number,
  medium       : number,
  rich         : number
}

export const DEFAULT_EARNING: Earning = {
  person       : 'XYZ',
  engageDays   : 0,
  earnDays     : 0,
  totalEarn    : 0,
  earnDayAvg   : 0,
  engageDayAvg : 0,
  avgAvg       : 0,
  poor         : 0,
  medium       : 0,
  rich         : 0
}