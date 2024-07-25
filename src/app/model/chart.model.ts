export interface ChartLinePoint {
  name: string,
  value: number
}

export interface ChartLine {
  name: string,
  series: ChartLinePoint[]
}
