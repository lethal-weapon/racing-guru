export const PLAYER_PLAIN_CONNECTIONS: string[][] = [
  ['NPC', 'HDA'], ['NPC', 'NM'], ['NPC', 'SJJ'], ['NPC', 'LFC'], ['NPC', 'YTP'], ['NPC', 'RW'],
  ['HDA', 'NM'], ['HDA', 'SJJ'], ['HDA', 'LFC'], ['HDA', 'YTP'], ['HDA', 'RW'],
  ['NM', 'SJJ'], ['NM', 'LFC'], ['NM', 'YTP'], ['NM', 'RW'],
  ['SJJ', 'LFC'], ['SJJ', 'YTP'], ['SJJ', 'RW'],
  ['LFC', 'YTP'], ['LFC', 'RW'],
  ['YTP', 'RW'],

  ['CAS', 'YPF'], ['CAS', 'LKW'], ['CAS', 'MKL'], ['CAS', 'SCS'], ['CAS', 'MWK'],
  ['YPF', 'LKW'], ['YPF', 'MKL'], ['YPF', 'SCS'], ['YPF', 'MWK'],
  ['LKW', 'MKL'], ['LKW', 'SCS'], ['LKW', 'MWK'],
  ['MKL', 'SCS'], ['MKL', 'MWK'],
  ['SCS', 'MWK'],

  ['FC', 'SWY'], ['FC', 'HAD'], ['FC', 'WDJ'], ['FC', 'EDJ'], ['FC', 'CCW'],
  ['SWY', 'HAD'], ['SWY', 'WDJ'], ['SWY', 'EDJ'], ['SWY', 'CCW'],
  ['HAD', 'WDJ'], ['HAD', 'EDJ'], ['HAD', 'CCW'],
  ['WDJ', 'EDJ'], ['WDJ', 'CCW'],
  ['EDJ', 'CCW'],

  ['YCH', 'TKH'], ['YCH', 'TYS'],
  ['TKH', 'TYS'],

  // Specials
  ['NPC', 'LKW'],
  ['HDA', 'CAS'], ['HDA', 'FC'], ['HDA', 'SWY'], ['HDA', 'HAD'], ['HDA', 'EDJ'], ['HDA', 'CCW'],
  ['NM', 'MWK'], ['NM', 'HAD'], ['NM', 'EDJ'],
  ['SJJ', 'FC'], ['SJJ', 'SWY'], ['SJJ', 'HAD'], ['SJJ', 'EDJ'],
  ['LFC', 'MKL'], ['LFC', 'FC'],
  ['YTP', 'SCS'], ['YTP', 'MWK'],
  ['RW', 'EDJ'],

  ['CAS', 'SWY'], ['CAS', 'WDJ'], ['CAS', 'YCH'], ['CAS', 'TYS'],
  ['YPF', 'WDJ'],
  ['LKW', 'FC'], ['LKW', 'WDJ'], ['LKW', 'TKH'], ['LKW', 'TYS'],
  ['SCS', 'TKH'],
  ['MWK', 'HAD'],

  ['SWY', 'YCH'],
  ['CCW', 'TKH'],
]
