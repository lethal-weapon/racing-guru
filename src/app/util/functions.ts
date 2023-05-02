import {ONE_MILLION} from "./numbers";

export const toMillion = (amount: number): string =>
  (amount / ONE_MILLION).toFixed(2)

export const getHorseProfileUrl = (brand: string): string => {
  return `
        https://racing.hkjc.com/racing/information/
        English/Horse/Horse.aspx?HorseNo=${brand}
    `.replace(/\s/g, '');
}
