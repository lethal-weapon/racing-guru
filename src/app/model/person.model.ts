export class Person {
  constructor(
    public code: string,
    public lastName: string,
    public firstName: string,
    public shortName: string,
    public nationality: string,
    public licence: string,
    public nickname: string
  ) {
  }
}

export const JOCKEYS = [
  new Person('PZ', 'Purton', 'Zac', 'Z. Purton', 'AUS', 'Club', ''),
  new Person('BH', 'Bowman', 'Hugh', 'H. Bowman', 'AUS', 'Club', ''),
  new Person('DSS', 'DeSousa', 'Silvestre', 'S. DeSousa', 'BRZ', 'Club', ''),
  new Person('TEK', 'Teetan', 'Karis', 'K. Teetan', 'MAU', 'Club', ''),
  new Person('BA', 'Badel', 'Alexis', 'A. Badel', 'FR', 'Club', ''),

  // new Person('MOJ', 'Moreira', 'Joao', 'J. Moreira', 'BRZ', 'Club', ''),
  // new Person('MCJ', 'McDonald', 'James', 'J. McDonald', 'NZ', 'Club', ''),
  // new Person('MTA', 'Marquand', 'Tom', 'T. Marquand', 'GB', 'Club', ''),
  // new Person('DC', 'Demuro', 'Cristian', 'C. Demuro', 'ITY', 'Club', ''),
  // new Person('MR', 'Moore', 'Ryan', 'R. Moore', 'GB', 'Club', ''),
  // new Person('SHB', 'Shinn', 'Blake', 'B. Shinn', 'AUS', 'Club', ''),
  // new Person('LDM', 'Lane', 'Damian', 'D. Lane', 'AUS', 'Club', ''),
  // new Person('KJL', 'Kah', 'Jamie', 'J. Kah', 'AUS', 'Club', ''),
  // new Person('DHA', 'Doyle', 'Hollie', 'H. Doyle', 'GB', 'Club', ''),
  // new Person('BUW', 'Buick', 'William', 'W. Buick', 'DEN', 'Club', ''),
  // new Person('LC', 'Lemaire', 'Christophe', 'C. Lemaire', 'FR', 'Club', ''),
  // new Person('BAM', 'Barzalona', 'Mickael', 'M. Barzalona', 'FR', 'Club', ''),
  // new Person('MNJ', 'McNeil', 'Jye', 'J. McNeil', 'AUS', 'Club', ''),
  // new Person('PC', 'Perkins', 'Charles', 'C. Perkins', 'FR', 'Club', ''),
  // new Person('NS', 'Nakano', 'Shogo', 'S. Nakano', 'JPN', 'Club', ''),
  // new Person('CCL', 'Cheung', 'Chi-lap', 'E. Cheung', 'HK', 'Freelance', 'Eric'),

  new Person('HCY', 'Ho', 'Chak-yiu', 'V. Ho', 'HK', 'Freelance', 'Vincent'),
  new Person('CML', 'Chadwick', 'Matthew L.', 'M. Chadwick', 'HK', 'Freelance', 'Lee'),
  new Person('LDE', 'Leung', 'Ka-chun', 'D. Leung', 'HK', 'Freelance', 'Derek'),
  new Person('CJE', 'Chau', 'Chun-lok', 'J. Chau', 'HK', 'Freelance', 'Jerry'),
  new Person('CCY', 'Chung', 'Yik-lai', 'A. Chung', 'HK', 'Freelance', 'Angus'),
  new Person('WEC', 'Wong', 'Chi-wang', 'E. Wong', 'HK', 'Freelance', 'Ellis'),
  new Person('YML', 'Yeung', 'Ming-lun', 'K. Yeung', 'HK', 'Freelance', 'Keith'),

  new Person('HEL', 'Hewitson', 'Lyle', 'L. Hewitson', 'SAF', 'Club', ''),
  new Person('FEL', 'Ferraris', 'Luke', 'L. Ferraris', 'SAF', 'Club', ''),
  new Person('BHW', 'Bentley', 'Harry W.M.', 'H. Bentley', 'GB', 'Club', 'William'),
  new Person('HAA', 'Hamelin', 'Antoine', 'A. Hamelin', 'FR', 'Club', ''),
  new Person('BV', 'Borges', 'Vagner', 'V. Borges', 'BRZ', 'Club', ''),
  new Person('MMR', 'Maia', 'Ruan', 'R. Maia', 'BRZ', 'Club', ''),
  new Person('AVB', 'Avdulla', 'Brenton', 'B. Avdulla', 'AUS', 'Club', ''),
  new Person('CLR', 'Currie', 'Luke R.', 'L. Currie', 'AUS', 'Club', 'Richard'),

  new Person('CHA', 'Chan', 'Ka-hei', 'A. Chan', 'HK', 'Freelance', 'Alfred'),
  new Person('PMF', 'Poon', 'Ming-fai', 'M. Poon', 'HK', 'Freelance', 'Matthew'),
  new Person('MHT', 'Mo', 'Hin-tung', 'D. Mo', 'HK', 'Freelance', 'Dylan'),
  new Person('WJH', 'Wong', 'Ho-nam', 'J. Wong', 'HK', 'Freelance', 'Jack'),
  new Person('WCV', 'Wong', 'Chun', 'V. Wong', 'HK', 'Freelance', 'Victor'),
  new Person('LHW', 'Lai', 'Hoi-wing', 'A. Lai', 'HK', 'Freelance', 'Alex'),
]

export const TRAINERS = [
  new Person('SJJ', 'Size', 'John', 'J. Size', 'AUS', '', ''),
  new Person('LFC', 'Lor', 'Fu-chuen', 'F. Lor', 'HK', '', 'Frankie'),
  new Person('NPC', 'Ng', 'Pang-chi', 'P. Ng', 'HK', '', 'Pierre'),
  new Person('HDA', 'Hayes', 'David', 'D. Hayes', 'AUS', '', ''),
  new Person('HAD', 'Hall', 'David', 'D. Hall', 'AUS', '', ''),

  new Person('YPF', 'Yiu', 'Poon-fai', 'R. Yiu', 'HK', '', 'Ricky'),
  new Person('SCS', 'Shum', 'Chap-shing', 'D. Shum', 'HK', '', 'Danny'),
  new Person('LKW', 'Lui', 'Kin-wai', 'F. Lui', 'HK', '', 'Francis'),
  new Person('FC', 'Fownes', 'Caspar', 'C. Fownes', 'GB', '', ''),
  new Person('SWY', 'So', 'Wai-yin', 'C. So', 'HK', '', 'Chris'),

  new Person('CAS', 'Cruz', 'Anthony S.', 'T. Cruz', 'HK', '', 'Tony'),
  new Person('WDJ', 'Whyte', 'Douglas', 'D. Whyte', 'SAF', '', ''),
  new Person('YCH', 'Yip', 'Chor-hong', 'D. Yip', 'HK', '', 'Dennis'),
  new Person('TKH', 'Ting', 'Koon-ho', 'J. Ting', 'HK', '', 'Jimmy'),
  new Person('YTP', 'Yung', 'Tin-pang', 'B. Yung', 'HK', '', 'Benno'),

  new Person('MKL', 'Man', 'Ka-leung', 'M. Man', 'HK', '', 'Manfred'),
  new Person('RW', 'Richards', 'Jamie', 'J. Richards', 'NZ', '', ''),
  new Person('GR', 'Gibson', 'Richard', 'R. Gibson', 'GB', '', ''),
  new Person('HL', 'Ho', 'Leung', 'P. Ho', 'HK', '', 'Peter'),
  new Person('CCW', 'Chang', 'Chun-wai', 'M. Chang', 'HK', '', 'Michael'),
  new Person('TYS', 'Tsui', 'Yu-sak', 'M. Tsui', 'HK', '', 'Me'),
  new Person('MA', 'Millard', 'Anthony T.', 'T. Millard', 'SAF', '', 'Tony'),
  // new Person('OSP', 'OSullivan', 'Paul', 'P. OSullivan', 'NZ', '', ''),
]

export const NEW_PEOPLE =
  JOCKEYS
    .filter(j => ['BH', 'DSS', 'CCY'].includes(j.code))
    .concat(TRAINERS.filter(t => ['NPC', 'RW'].includes(t.code)))

export const GONE_PEOPLE =
  JOCKEYS
    .filter(j => ['MOJ', 'SHB'].includes(j.code))
    .concat(TRAINERS.filter(t => ['OSP'].includes(t.code)))
