export class Person {
  constructor(
    public code: string,
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
  new Person('SJJ', 'Size', 'John', 'J. Size', 'AUS', '', '', 1414),
  new Person('LFC', 'Lor', 'Fu-chuen', 'F. Lor', 'HK', '', 'Frankie', 329),
  new Person('NPC', 'Ng', 'Pang-chi', 'P. Ng', 'HK', '', 'Pierre', 0),
  new Person('HAD', 'Hall', 'David', 'D. Hall', 'AUS', '', '', 546),
  new Person('HDA', 'Hayes', 'David', 'D. Hayes', 'AUS', '', '', 526),

  new Person('CAS', 'Cruz', 'Anthony S.', 'T. Cruz', 'HK', '', 'Tony', 1413),
  new Person('YPF', 'Yiu', 'Poon-fai', 'R. Yiu', 'HK', '', 'Ricky', 899),
  new Person('LKW', 'Lui', 'Kin-wai', 'F. Lui', 'HK', '', 'Francis', 798),
  new Person('MKL', 'Man', 'Ka-leung', 'M. Man', 'HK', '', 'Manfred', 580),
  new Person('SCS', 'Shum', 'Chap-shing', 'D. Shum', 'HK', '', 'Danny', 731),
  new Person('YTP', 'Yung', 'Tin-pang', 'B. Yung', 'HK', '', 'Benno', 278),

  new Person('FC', 'Fownes', 'Caspar', 'C. Fownes', 'GB', '', '', 1012),
  new Person('WDJ', 'Whyte', 'Douglas', 'D. Whyte', 'SAF', '', '', 131),
  new Person('SWY', 'So', 'Wai-yin', 'C. So', 'HK', '', 'Chris', 308),
  new Person('YCH', 'Yip', 'Chor-hong', 'D. Yip', 'HK', '', 'Dennis', 797),
  new Person('TKH', 'Ting', 'Koon-ho', 'J. Ting', 'HK', '', 'Jimmy', 134),

  new Person('RW', 'Richards', 'Jamie', 'J. Richards', 'NZ', '', '', 0),
  new Person('NM', 'Newnham', 'Mark', 'M. Newnham', 'AUS', '', '', 0),
  new Person('MWK', 'Mo', 'Wai-kit', 'C. Mo', 'HK', '', 'Cody', 0),
  new Person('CCW', 'Chang', 'Chun-wai', 'M. Chang', 'HK', '', 'Michael', 321),
  new Person('TYS', 'Tsui', 'Yu-sak', 'M. Tsui', 'HK', '', 'Me', 597),

  // new Person('HL', 'Ho', 'Leung', 'P. Ho', 'HK', '', 'Peter', 618),
  // new Person('GR', 'Gibson', 'Richard', 'R. Gibson', 'GB', '', '', 277),
  // new Person('MA', 'Millard', 'Anthony T.', 'T. Millard', 'SAF', '', 'Tony', 700),
  // new Person('OSP', 'OSullivan', 'Paul', 'P. OSullivan', 'NZ', '', '', 0),
]

export const JOCKEYS = [
  new Person('PZ', 'Purton', 'Zac', 'Z. Purton', 'AUS', 'Club', '', 1431),
  new Person('BH', 'Bowman', 'Hugh', 'H. Bowman', 'AUS', 'Club', '', 29),
  new Person('AVB', 'Avdulla', 'Brenton', 'B. Avdulla', 'AUS', 'Club', '', 0),
  new Person('CLR', 'Currie', 'Luke R.', 'L. Currie', 'AUS', 'Club', 'Richard', 9),

  new Person('TEK', 'Teetan', 'Karis', 'K. Teetan', 'MAU', 'Club', '', 547),
  new Person('HEL', 'Hewitson', 'Lyle', 'L. Hewitson', 'SAF', 'Club', '', 30),
  new Person('FEL', 'Ferraris', 'Luke', 'L. Ferraris', 'SAF', 'Club', '', 20),
  new Person('DMK', 'DeMelo', 'Keagan', 'K. DeMelo', 'SAF', 'Club', '', 0),

  new Person('BA', 'Badel', 'Alexis', 'A. Badel', 'FR', 'Club', '', 165),
  new Person('BHW', 'Bentley', 'Harry W.M.', 'H. Bentley', 'GB', 'Club', 'William', 30),
  new Person('HAA', 'Hamelin', 'Antoine', 'A. Hamelin', 'FR', 'Club', '', 60),
  new Person('AA', 'Atzeni', 'Andrea', 'A. Atzeni', 'ITY', 'Club', '', 0),

  new Person('HCY', 'Ho', 'Chak-yiu', 'V. Ho', 'HK', 'Freelance', 'Vincent', 446),
  new Person('CML', 'Chadwick', 'Matthew L.', 'M. Chadwick', 'HK', 'Freelance', 'Lee', 461),
  new Person('LDE', 'Leung', 'Ka-chun', 'D. Leung', 'HK', 'Freelance', 'Derek', 399),
  new Person('CJE', 'Chau', 'Chun-lok', 'J. Chau', 'HK', 'Freelance', 'Jerry', 95),
  new Person('YML', 'Yeung', 'Ming-lun', 'K. Yeung', 'HK', 'Freelance', 'Keith', 275),
  new Person('CCY', 'Chung', 'Yik-lai', 'A. Chung', 'HK', 'Freelance', 'Angus', 0),
  new Person('WEC', 'Wong', 'Chi-wang', 'E. Wong', 'HK', 'Freelance', 'Ellis', 0),
  new Person('CHA', 'Chan', 'Ka-hei', 'A. Chan', 'HK', 'Freelance', 'Alfred', 53),
  new Person('PMF', 'Poon', 'Ming-fai', 'M. Poon', 'HK', 'Freelance', 'Matthew', 192),
  new Person('MHT', 'Mo', 'Hin-tung', 'D. Mo', 'HK', 'Freelance', 'Dylan', 104),

  // new Person('WJH', 'Wong', 'Ho-nam', 'J. Wong', 'HK', 'Freelance', 'Jack', 88),
  // new Person('WCV', 'Wong', 'Chun', 'V. Wong', 'HK', 'Freelance', 'Victor', 63),
  // new Person('LHW', 'Lai', 'Hoi-wing', 'A. Lai', 'HK', 'Freelance', 'Alex', 283),
  // new Person('DEE', 'Dee', 'Michael', 'M. Dee', 'NZ', 'Club', '', 0),
  // new Person('MCJ', 'McDonald', 'James', 'J. McDonald', 'NZ', 'Club', '', 0),
  // new Person('MTA', 'Marquand', 'Tom', 'T. Marquand', 'GB', 'Club', '', 0),
  // new Person('DC', 'Demuro', 'Cristian', 'C. Demuro', 'ITY', 'Club', '', 0),
  // new Person('MR', 'Moore', 'Ryan', 'R. Moore', 'GB', 'Club', '', 0),
  // new Person('SHB', 'Shinn', 'Blake', 'B. Shinn', 'AUS', 'Club', '', 0),
  // new Person('LDM', 'Lane', 'Damian', 'D. Lane', 'AUS', 'Club', '', 0),
  // new Person('KJL', 'Kah', 'Jamie', 'J. Kah', 'AUS', 'Club', '', 0),
  // new Person('DHA', 'Doyle', 'Hollie', 'H. Doyle', 'GB', 'Club', '', 0),
  // new Person('BUW', 'Buick', 'William', 'W. Buick', 'DEN', 'Club', '', 0),
  // new Person('LC', 'Lemaire', 'Christophe', 'C. Lemaire', 'FR', 'Club', '', 0),
  // new Person('BAM', 'Barzalona', 'Mickael', 'M. Barzalona', 'FR', 'Club', '', 0),
  // new Person('MNJ', 'McNeil', 'Jye', 'J. McNeil', 'AUS', 'Club', '', 0),
  // new Person('PC', 'Perkins', 'Charles', 'C. Perkins', 'FR', 'Club', '', 0),
  // new Person('NS', 'Nakano', 'Shogo', 'S. Nakano', 'JPN', 'Club', '', 0),
  // new Person('CCL', 'Cheung', 'Chi-lap', 'E. Cheung', 'HK', 'Freelance', 'Eric', 0),
  // new Person('MOJ', 'Moreira', 'Joao', 'J. Moreira', 'BRZ', 'Club', '', 0),
  // new Person('DSS', 'DeSousa', 'Silvestre', 'S. DeSousa', 'BRZ', 'Club', '', 0),
  // new Person('MMR', 'Maia', 'Ruan', 'R. Maia', 'BRZ', 'Club', '', 0),
  // new Person('BV', 'Borges', 'Vagner', 'V. Borges', 'BRZ', 'Club', '', 0),
]

export const NEW_PEOPLE =
  JOCKEYS
    .filter(j => ['AVB', 'DMK', 'AA', 'WEC'].includes(j.code))
    .concat(TRAINERS.filter(t => ['NM', 'MWK'].includes(t.code)))
