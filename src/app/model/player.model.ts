export interface CareerWin {
  upToDate: string,
  wins: number
}

export class Player {
  constructor(
    public code: string,
    public dateOfBirth: string,
    public lastName: string,
    public firstName: string,
    public shortName: string,
    public nickname: string,
    public nationality: string,
    public licence: string,
    public careerWins: CareerWin[],
    public order: number,
    public jockey: boolean,
    public active: boolean,
    public boundary: boolean,
    public newcomer: boolean
  ) {
  }
}

export const DEFAULT_PLAYER: Player = {
  code: 'XXX',
  dateOfBirth: '1980-01-01',
  lastName: 'Smith',
  firstName: 'John',
  shortName: 'J Smith',
  nickname: 'John',
  nationality: 'AUS',
  licence: 'Club',
  careerWins: [{upToDate: '2023-09-11', wins: 1234}],
  order: 0,
  jockey: true,
  active: true,
  boundary: false,
  newcomer: false
}

export const TRAINERS = [
  new Player(
    'NPC',
    '1983-08-02',
    'Ng',
    'Pang-chi',
    'P C Ng',
    'Pierre',
    'HK',
    '',
    [{upToDate: '2022-09-11', wins: 0}],
    1,
    false,
    true,
    false,
    false
  ),

  // new Player('SJJ', '1954-07-10', 'Size', 'John', 'J. Size', 'AUS', '', '', 1414),
  // new Player('YTP', '1958-12-03', 'Yung', 'Tin-pang', 'B. Yung', 'HK', '', 'Benno', 278),
  // new Player('LFC', '1966-02-14', 'Lor', 'Fu-chuen', 'F. Lor', 'HK', '', 'Frankie', 329),
  // new Player('HDA', '1962-10-22', 'Hayes', 'David', 'D. Hayes', 'AUS', '', '', 526),
  // new Player('RW', '1989-08-19', 'Richards', 'Jamie', 'J. Richards', 'NZ', '', '', 0),
  // new Player('NM', '1968-01-01', 'Newnham', 'Mark', 'M. Newnham', 'AUS', '', '', 0),
  //
  // new Player('CAS', '1956-12-24', 'Cruz', 'Anthony S.', 'T. Cruz', 'HK', '', 'Tony', 1413),
  // new Player('YPF', '1957-07-12', 'Yiu', 'Poon-fai', 'R. Yiu', 'HK', '', 'Ricky', 899),
  // new Player('LKW', '1959-01-22', 'Lui', 'Kin-wai', 'F. Lui', 'HK', '', 'Francis', 798),
  // new Player('MKL', '1957-07-18', 'Man', 'Ka-leung', 'M. Man', 'HK', '', 'Manfred', 580),
  // new Player('SCS', '1959-06-27', 'Shum', 'Chap-shing', 'D. Shum', 'HK', '', 'Danny', 731),
  //
  // new Player('FC', '1967-08-12', 'Fownes', 'Caspar', 'C. Fownes', 'GB', '', '', 1012),
  // new Player('WDJ', '1971-11-15', 'Whyte', 'Douglas', 'D. Whyte', 'SAF', '', '', 131),
  // new Player('HAD', '1963-10-27', 'Hall', 'David', 'D. Hall', 'AUS', '', '', 546),
  // new Player('SWY', '1968-12-10', 'So', 'Wai-yin', 'C. So', 'HK', '', 'Chris', 308),
  // new Player('CCW', '1961-12-02', 'Chang', 'Chun-wai', 'M. Chang', 'HK', '', 'Michael', 321),
  //
  // new Player('YCH', '1967-07-28', 'Yip', 'Chor-hong', 'D. Yip', 'HK', '', 'Dennis', 797),
  // new Player('TKH', '1972-08-09', 'Ting', 'Koon-ho', 'J. Ting', 'HK', '', 'Jimmy', 134),
  // new Player('TYS', '1960-09-30', 'Tsui', 'Yu-sak', 'M. Tsui', 'HK', '', 'Me', 597),
  // new Player('MWK', '1978-01-01', 'Mo', 'Wai-kit', 'C. Mo', 'HK', '', 'Cody', 0),
  //
  // new Player('HL', '1960-07-06', 'Ho', 'Leung', 'P. Ho', 'HK', '', 'Peter', 618),
  // new Player('GR', '1969-09-12', 'Gibson', 'Richard', 'R. Gibson', 'GB', '', '', 277),
  // new Player('MA', '1961-11-13', 'Millard', 'Anthony T.', 'T. Millard', 'SAF', '', 'Tony', 700),
  // new Player('OSP', '1960-12-06', 'OSullivan', 'Paul', 'P. OSullivan', 'NZ', '', '', 0),
]

export const JOCKEYS = [
  new Player(
    'PZ',
    '1983-01-03',
    'Purton',
    'Zac',
    'Z Purton',
    '',
    'AUS',
    'Club',
    [{upToDate: '2022-09-11', wins: 1431}],
    1,
    true,
    true,
    false,
    false
  ),

  // new Player('BH', '1980-07-14', 'Bowman', 'Hugh', 'H. Bowman', 'AUS', 'Club', '', 29),
  // new Player('MCJ', '1992-01-06', 'McDonald', 'James', 'J. McDonald', 'NZ', 'Club', '', 8),
  // new Player('SHB', '1987-09-26', 'Shinn', 'Blake', 'B. Shinn', 'AUS', 'Club', '', 0),
  // new Player('AVB', '1991-01-18', 'Avdulla', 'Brenton', 'B. Avdulla', 'AUS', 'Club', '', 0),
  // new Player('TBE', '1997-01-01', 'Thompson', 'Ben', 'B. Thompson', 'AUS', 'Club', '', 0),
  //
  // new Player('TEK', '1990-06-03', 'Teetan', 'Karis', 'K. Teetan', 'MAU', 'Club', '', 547),
  // new Player('HEL', '1997-10-30', 'Hewitson', 'Lyle', 'L. Hewitson', 'SAF', 'Club', '', 30),
  // new Player('FEL', '2001-12-27', 'Ferraris', 'Luke', 'L. Ferraris', 'SAF', 'Club', '', 20),
  // new Player('DMK', '1993-09-24', 'DeMelo', 'Keagan', 'K. DeMelo', 'SAF', 'Club', '', 0),
  //
  // new Player('MR', '1983-09-18', 'Moore', 'Ryan', 'R. Moore', 'GB', 'Club', '', 0),
  // new Player('BUW', '1988-07-22', 'Buick', 'William', 'W. Buick', 'DEN', 'Club', '', 2),
  // new Player('AA', '1991-03-26', 'Atzeni', 'Andrea', 'A. Atzeni', 'ITY', 'Club', '', 3),
  // new Player('BA', '1989-12-05', 'Badel', 'Alexis', 'A. Badel', 'FR', 'Club', '', 165),
  // new Player('BHW', '1992-06-10', 'Bentley', 'Harry W.M.', 'H. Bentley', 'GB', 'Club', 'William', 30),
  // new Player('HAA', '1991-06-11', 'Hamelin', 'Antoine', 'A. Hamelin', 'FR', 'Club', '', 60),
  //
  // new Player('HCY', '1990-05-25', 'Ho', 'Chak-yiu', 'V. Ho', 'HK', 'Freelance', 'Vincent', 446),
  // new Player('CML', '1990-07-12', 'Chadwick', 'Matthew L.', 'M. Chadwick', 'HK', 'Freelance', 'Lee', 461),
  // new Player('LDE', '1988-07-30', 'Leung', 'Ka-chun', 'D. Leung', 'HK', 'Freelance', 'Derek', 399),
  // new Player('YML', '1988-04-10', 'Yeung', 'Ming-lun', 'K. Yeung', 'HK', 'Freelance', 'Keith', 275),
  // new Player('CCY', '1996-09-06', 'Chung', 'Yik-lai', 'A. Chung', 'HK', 'Freelance', 'Angus', 0),
  // new Player('CJE', '2000-04-16', 'Chau', 'Chun-lok', 'J. Chau', 'HK', 'Freelance', 'Jerry', 95),
  // new Player('PMF', '1993-11-09', 'Poon', 'Ming-fai', 'M. Poon', 'HK', 'Freelance', 'Matthew', 192),
  // new Player('CHA', '1994-06-05', 'Chan', 'Ka-hei', 'A. Chan', 'HK', 'Freelance', 'Alfred', 53),
  // new Player('WEC', '2000-10-18', 'Wong', 'Chi-wang', 'E. Wong', 'HK', 'Freelance', 'Ellis', 0),
  // new Player('MHT', '1993-10-22', 'Mo', 'Hin-tung', 'D. Mo', 'HK', 'Freelance', 'Dylan', 104),
  //
  // new Player('BAM', '1991-08-03', 'Barzalona', 'Mickael', 'M. Barzalona', 'FR', 'Club', '', 0),
  // new Player('LDM', '1994-02-06', 'Lane', 'Damian', 'D. Lane', 'AUS', 'Club', '', 8),
  // new Player('KJL', '1995-12-07', 'Kah', 'Jamie', 'J. Kah', 'AUS', 'Club', '', 0),
  // new Player('CLR', '1981-07-24', 'Currie', 'Luke R.', 'L. Currie', 'AUS', 'Club', 'Richard', 9),
  // new Player('MOJ', '1983-09-26', 'Moreira', 'Joao', 'J. Moreira', 'BRZ', 'Club', '', 1234),
  // new Player('KAY', '1985-10-15', 'Kawada', 'Yuga', 'Y. Kawada', 'JPN', 'Club', '', 0),
  // new Player('KIY', '1986-10-03', 'Kitamura', 'Yuichi', 'Y. Kitamura', 'JPN', 'Club', '', 0),
  // new Player('HJC', '1994-01-01', 'Hart', 'Jason', 'J. Hart', 'GB', 'Club', '', 0),
  // new Player('SC', '1981-06-04', 'Soumillon', 'Christophe', 'C. Soumillon', 'BEL', 'Club', '', 121),
  // new Player('DC', '1992-07-07', 'Demuro', 'Cristian', 'C. Demuro', 'ITY', 'Club', '', 0),
  // new Player('GM', '1989-05-07', 'Guyon', 'Maxime', 'M. Guyon', 'FR', 'Club', '', 29),
  // new Player('MTA', '1998-03-30', 'Marquand', 'Tom', 'T. Marquand', 'GB', 'Club', '', 0),
  // new Player('DHA', '1996-10-11', 'Doyle', 'Hollie', 'H. Doyle', 'GB', 'Club', '', 0),
  // new Player('KRM', '1990-09-16', 'King', 'Richel', 'R. King', 'GB', 'Club', '', 0),
  // new Player('MBA', '1992-09-17', 'Murzabayev', 'Bauyrzhan', 'B. Murzabayev', 'KAZ', 'Club', '', 0),
  // new Player('WJH', '1993-10-22', 'Wong', 'Ho-nam', 'J. Wong', 'HK', 'Freelance', 'Jack', 88),
  // new Player('WCV', '1993-09-07', 'Wong', 'Chun', 'V. Wong', 'HK', 'Freelance', 'Victor', 63),
  // new Player('LHW', '1983-10-29', 'Lai', 'Hoi-wing', 'A. Lai', 'HK', 'Freelance', 'Alex', 283),
  // new Player('DEE', '1996-01-01', 'Dee', 'Michael', 'M. Dee', 'NZ', 'Club', '', 0),
  // new Player('LC', '1979-05-20', 'Lemaire', 'Christophe', 'C. Lemaire', 'FR', 'Club', '', 0),
  // new Player('MNJ', '1994-12-09', 'McNeil', 'Jye', 'J. McNeil', 'AUS', 'Club', '', 0),
  // new Player('DSS', '1980-12-31', 'DeSousa', 'Silvestre', 'S. DeSousa', 'BRZ', 'Club', '', 0),
  // new Player('MMR', '1988-05-05', 'Maia', 'Ruan', 'R. Maia', 'BRZ', 'Club', '', 0),
  // new Player('BV', '1993-03-01', 'Borges', 'Vagner', 'V. Borges', 'BRZ', 'Club', '', 0),
  // new Player('PC', '', 'Perkins', 'Charles', 'C. Perkins', 'FR', 'Club', '', 0),
  // new Player('NS', '', 'Nakano', 'Shogo', 'S. Nakano', 'JPN', 'Club', '', 0),
  // new Player('CCL', '', 'Cheung', 'Chi-lap', 'E. Cheung', 'HK', 'Freelance', 'Eric', 0),
]

// export const NEW_PEOPLE =
//   JOCKEYS
//     .filter(j => ['AVB', 'DMK', 'AA', 'WEC'].includes(j.code))
//     .concat(TRAINERS.filter(t => ['NM', 'MWK'].includes(t.code)))
