export class Person {
  constructor(
    public code: string,
    public dateOfBirth: string,
    public lastName: string,
    public firstName: string,
    public shortName: string,
    public nationality: string,
    public licence: string,
    public nickname: string,
    public careerWins: number
  ) {
  }
}

export const TRAINERS = [
  new Person('NPC', '1983-08-02', 'Ng', 'Pang-chi', 'P. Ng', 'HK', '', 'Pierre', 0),
  new Person('SJJ', '1954-07-10', 'Size', 'John', 'J. Size', 'AUS', '', '', 1414),
  new Person('YTP', '1958-12-03', 'Yung', 'Tin-pang', 'B. Yung', 'HK', '', 'Benno', 278),
  new Person('LFC', '1966-02-14', 'Lor', 'Fu-chuen', 'F. Lor', 'HK', '', 'Frankie', 329),
  new Person('HDA', '1962-10-22', 'Hayes', 'David', 'D. Hayes', 'AUS', '', '', 526),

  new Person('CAS', '1956-12-24', 'Cruz', 'Anthony S.', 'T. Cruz', 'HK', '', 'Tony', 1413),
  new Person('YPF', '1957-07-12', 'Yiu', 'Poon-fai', 'R. Yiu', 'HK', '', 'Ricky', 899),
  new Person('LKW', '1959-01-22', 'Lui', 'Kin-wai', 'F. Lui', 'HK', '', 'Francis', 798),
  new Person('MKL', '1957-07-18', 'Man', 'Ka-leung', 'M. Man', 'HK', '', 'Manfred', 580),
  new Person('SCS', '1959-06-27', 'Shum', 'Chap-shing', 'D. Shum', 'HK', '', 'Danny', 731),

  new Person('FC', '1967-08-12', 'Fownes', 'Caspar', 'C. Fownes', 'GB', '', '', 1012),
  new Person('WDJ', '1971-11-15', 'Whyte', 'Douglas', 'D. Whyte', 'SAF', '', '', 131),
  new Person('HAD', '1963-10-27', 'Hall', 'David', 'D. Hall', 'AUS', '', '', 546),
  new Person('RW', '1989-08-19', 'Richards', 'Jamie', 'J. Richards', 'NZ', '', '', 0),
  new Person('NM', '1968-01-01', 'Newnham', 'Mark', 'M. Newnham', 'AUS', '', '', 0),

  new Person('SWY', '1968-12-10', 'So', 'Wai-yin', 'C. So', 'HK', '', 'Chris', 308),
  new Person('CCW', '1961-12-02', 'Chang', 'Chun-wai', 'M. Chang', 'HK', '', 'Michael', 321),
  new Person('YCH', '1967-07-28', 'Yip', 'Chor-hong', 'D. Yip', 'HK', '', 'Dennis', 797),
  new Person('TKH', '1972-08-09', 'Ting', 'Koon-ho', 'J. Ting', 'HK', '', 'Jimmy', 134),
  new Person('TYS', '1960-09-30', 'Tsui', 'Yu-sak', 'M. Tsui', 'HK', '', 'Me', 597),
  new Person('MWK', '1978-01-01', 'Mo', 'Wai-kit', 'C. Mo', 'HK', '', 'Cody', 0),

  // new Person('HL', '1960-07-06', 'Ho', 'Leung', 'P. Ho', 'HK', '', 'Peter', 618),
  // new Person('GR', '1969-09-12', 'Gibson', 'Richard', 'R. Gibson', 'GB', '', '', 277),
  // new Person('MA', '1961-11-13', 'Millard', 'Anthony T.', 'T. Millard', 'SAF', '', 'Tony', 700),
  // new Person('OSP', '1960-12-06', 'OSullivan', 'Paul', 'P. OSullivan', 'NZ', '', '', 0),
]

export const JOCKEYS = [
  new Person('PZ', '1983-01-03', 'Purton', 'Zac', 'Z. Purton', 'AUS', 'Club', '', 1431),
  new Person('BH', '1980-07-14', 'Bowman', 'Hugh', 'H. Bowman', 'AUS', 'Club', '', 29),
  // new Person('MCJ', '1992-01-06', 'McDonald', 'James', 'J. McDonald', 'NZ', 'Club', '', 8),
  new Person('AVB', '1991-01-18', 'Avdulla', 'Brenton', 'B. Avdulla', 'AUS', 'Club', '', 0),

  new Person('TEK', '1990-06-03', 'Teetan', 'Karis', 'K. Teetan', 'MAU', 'Club', '', 547),
  new Person('HEL', '1997-10-30', 'Hewitson', 'Lyle', 'L. Hewitson', 'SAF', 'Club', '', 30),
  new Person('FEL', '2001-12-27', 'Ferraris', 'Luke', 'L. Ferraris', 'SAF', 'Club', '', 20),
  new Person('DMK', '1993-09-24', 'DeMelo', 'Keagan', 'K. DeMelo', 'SAF', 'Club', '', 0),

  new Person('AA', '1991-03-26', 'Atzeni', 'Andrea', 'A. Atzeni', 'ITY', 'Club', '', 3),
  new Person('BA', '1989-12-05', 'Badel', 'Alexis', 'A. Badel', 'FR', 'Club', '', 165),
  new Person('BHW', '1992-06-10', 'Bentley', 'Harry W.M.', 'H. Bentley', 'GB', 'Club', 'William', 30),
  new Person('HAA', '1991-06-11', 'Hamelin', 'Antoine', 'A. Hamelin', 'FR', 'Club', '', 60),

  new Person('HCY', '1990-05-25', 'Ho', 'Chak-yiu', 'V. Ho', 'HK', 'Freelance', 'Vincent', 446),
  new Person('CML', '1990-07-12', 'Chadwick', 'Matthew L.', 'M. Chadwick', 'HK', 'Freelance', 'Lee', 461),
  new Person('LDE', '1988-07-30', 'Leung', 'Ka-chun', 'D. Leung', 'HK', 'Freelance', 'Derek', 399),
  new Person('YML', '1988-04-10', 'Yeung', 'Ming-lun', 'K. Yeung', 'HK', 'Freelance', 'Keith', 275),

  new Person('CCY', '1996-09-06', 'Chung', 'Yik-lai', 'A. Chung', 'HK', 'Freelance', 'Angus', 0),
  new Person('CJE', '2000-04-16', 'Chau', 'Chun-lok', 'J. Chau', 'HK', 'Freelance', 'Jerry', 95),
  new Person('PMF', '1993-11-09', 'Poon', 'Ming-fai', 'M. Poon', 'HK', 'Freelance', 'Matthew', 192),
  new Person('WEC', '2000-10-18', 'Wong', 'Chi-wang', 'E. Wong', 'HK', 'Freelance', 'Ellis', 0),
  new Person('CHA', '1994-06-05', 'Chan', 'Ka-hei', 'A. Chan', 'HK', 'Freelance', 'Alfred', 53),
  new Person('MHT', '1993-10-22', 'Mo', 'Hin-tung', 'D. Mo', 'HK', 'Freelance', 'Dylan', 104),

  // new Person('CLR', '1981-07-24', 'Currie', 'Luke R.', 'L. Currie', 'AUS', 'Club', 'Richard', 9),
  // new Person('MOJ', '1983-09-26', 'Moreira', 'Joao', 'J. Moreira', 'BRZ', 'Club', '', 1234),
  // new Person('LDM', '1994-02-06', 'Lane', 'Damian', 'D. Lane', 'AUS', 'Club', '', 8),
  // new Person('KAY', '1985-10-15', 'Kawada', 'Yuga', 'Y. Kawada', 'JPN', 'Club', '', 0),
  // new Person('KIY', '1986-10-03', 'Kitamura', 'Yuichi', 'Y. Kitamura', 'JPN', 'Club', '', 0),
  // new Person('MR', '1983-09-18', 'Moore', 'Ryan', 'R. Moore', 'GB', 'Club', '', 0),
  // new Person('BUW', '1988-07-22', 'Buick', 'William', 'W. Buick', 'DEN', 'Club', '', 2),
  // new Person('HJC', '1994-01-01', 'Hart', 'Jason', 'J. Hart', 'GB', 'Club', '', 0),
  // new Person('SC', '1981-06-04', 'Soumillon', 'Christophe', 'C. Soumillon', 'BEL', 'Club', '', 121),
  // new Person('DC', '1992-07-07', 'Demuro', 'Cristian', 'C. Demuro', 'ITY', 'Club', '', 0),
  // new Person('BAM', '1991-08-03', 'Barzalona', 'Mickael', 'M. Barzalona', 'FR', 'Club', '', 0),
  // new Person('GM', '1989-05-07', 'Guyon', 'Maxime', 'M. Guyon', 'FR', 'Club', '', 29),
  // new Person('MTA', '1998-03-30', 'Marquand', 'Tom', 'T. Marquand', 'GB', 'Club', '', 0),
  // new Person('DHA', '1996-10-11', 'Doyle', 'Hollie', 'H. Doyle', 'GB', 'Club', '', 0),
  // new Person('KRM', '1990-09-16', 'King', 'Richel', 'R. King', 'GB', 'Club', '', 0),
  // new Person('MBA', '1992-09-17', 'Murzabayev', 'Bauyrzhan', 'B. Murzabayev', 'KAZ', 'Club', '', 0),
  // new Person('WJH', '1993-10-22', 'Wong', 'Ho-nam', 'J. Wong', 'HK', 'Freelance', 'Jack', 88),
  // new Person('WCV', '1993-09-07', 'Wong', 'Chun', 'V. Wong', 'HK', 'Freelance', 'Victor', 63),
  // new Person('LHW', '1983-10-29', 'Lai', 'Hoi-wing', 'A. Lai', 'HK', 'Freelance', 'Alex', 283),
  // new Person('DEE', '1996-01-01', 'Dee', 'Michael', 'M. Dee', 'NZ', 'Club', '', 0),
  // new Person('SHB', '1987-09-26', 'Shinn', 'Blake', 'B. Shinn', 'AUS', 'Club', '', 0),
  // new Person('KJL', '1995-12-07', 'Kah', 'Jamie', 'J. Kah', 'AUS', 'Club', '', 0),
  // new Person('LC', '1979-05-20', 'Lemaire', 'Christophe', 'C. Lemaire', 'FR', 'Club', '', 0),
  // new Person('MNJ', '1994-12-09', 'McNeil', 'Jye', 'J. McNeil', 'AUS', 'Club', '', 0),
  // new Person('DSS', '1980-12-31', 'DeSousa', 'Silvestre', 'S. DeSousa', 'BRZ', 'Club', '', 0),
  // new Person('MMR', '1988-05-05', 'Maia', 'Ruan', 'R. Maia', 'BRZ', 'Club', '', 0),
  // new Person('BV', '1993-03-01', 'Borges', 'Vagner', 'V. Borges', 'BRZ', 'Club', '', 0),
  // new Person('PC', '', 'Perkins', 'Charles', 'C. Perkins', 'FR', 'Club', '', 0),
  // new Person('NS', '', 'Nakano', 'Shogo', 'S. Nakano', 'JPN', 'Club', '', 0),
  // new Person('CCL', '', 'Cheung', 'Chi-lap', 'E. Cheung', 'HK', 'Freelance', 'Eric', 0),
]

export const NEW_PEOPLE =
  JOCKEYS
    .filter(j => ['AVB', 'DMK', 'AA', 'WEC'].includes(j.code))
    .concat(TRAINERS.filter(t => ['NM', 'MWK'].includes(t.code)))
