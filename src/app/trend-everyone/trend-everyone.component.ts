import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {EarningStarter, Meeting} from '../model/meeting.model';
import {DEFAULT_PLAYER_WINNER, PlayerWinner} from '../model/reminder.model';
import {COLORS} from '../util/strings';
import {MAX_RACE_PER_MEETING} from '../util/numbers';
import {toPlacingColor} from '../util/functions';
import {
  DEFAULT_SYNDICATE_SNAPSHOT,
  StarterSnapshot,
  SyndicateSnapshot
} from '../model/syndicate.model';

const MEETING_WINDOW_SIZE = 7;

interface MeetingOverview {
  title: string,
  link: string,
  meeting: string
}

interface TablePlacing {
  placing: string,
  key: string,
  color: string,
  width: string
}

interface HorseView {
  horse: string,
  horseNameCH: string,
  starters: EarningStarter[],
}

@Component({
  selector: 'app-trend-everyone',
  templateUrl: './trend-everyone.component.html'
})
export class TrendEveryoneComponent implements OnInit {

  meetingIndex: number = 0;
  activePlayer: string = 'WDJ';
  activeMeeting: string = '';
  activePlayerType: string = this.playerTypes[0];
  activePlayerView: string = this.playerViews[0];

  protected readonly COLORS = COLORS;
  protected readonly MEETING_WINDOW_SIZE = MEETING_WINDOW_SIZE;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;
  protected readonly toPlacingColor = toPlacingColor;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  shiftMeeting = (length: number) => {
    const ws = MEETING_WINDOW_SIZE;
    const maxIndex = this.meetings.length - ws;

    switch (length) {
      case -999:
        this.meetingIndex = 0;
        break;
      case 999:
        this.meetingIndex = maxIndex;
        break;
      case -1:
        if (this.meetingIndex > 0) this.meetingIndex -= 1;
        break;
      case 1:
        if (this.meetingIndex < maxIndex) this.meetingIndex += 1;
        break;
      case -ws:
        if (this.meetingIndex >= ws) this.meetingIndex -= ws;
        else this.meetingIndex = 0;
        break;
      case ws:
        if (this.meetingIndex < maxIndex - ws) this.meetingIndex += ws;
        else this.meetingIndex = maxIndex;
        break;
    }
  }

  getSyndicatePerformanceHitColor = (hit: string): string => {
    if (hit.startsWith('W')) return COLORS[0];
    if (hit.startsWith('Q')) return COLORS[1];
    if (hit.startsWith('T')) return COLORS[2];
    if (hit.startsWith('F')) return COLORS[3];
    return '';
  }

  getSyndicatePerformanceHits = (meeting: string, race: number): string[] => {
    const performance = this.repo
      .findSyndicateSnapshots()
      .find(ss => ss.meeting === meeting)
      ?.performances
      .find(p => p.race === race);

    if (performance) {
      return [
        performance?.single || '',
        performance?.multiple || '',
        performance?.sole || ''
      ];
    }

    return ['', '', ''];
  }

  getSyndicateStarters = (kind: string, race: number): StarterSnapshot[] => {
    switch (kind) {
      case 'SINGLE':
        return this.activeSyndicateSnapshot.syndicates
          .filter(s => s.starterCount === 1)
          .flatMap(s => s.starters)
          .filter(s => s.race === race)
          .sort((s1, s2) => s1.order - s2.order);

      case 'MULTIPLE':
        return this.activeSyndicateSnapshot.syndicates
          .filter(s => s.starterCount > 1)
          .flatMap(s => s.starters)
          .filter(s => s.race === race)
          .sort((s1, s2) => s1.order - s2.order);

      case 'SOLE':
        return this.activeSyndicateSnapshot.soleStarters
          .filter(s => s.race === race)
          .sort((s1, s2) => s1.order - s2.order);

      default:
        return [];
    }
  }

  getSyndicateStarterCount = (kind: string): number => {
    switch (kind) {
      case 'SINGLE':
        return this.activeSyndicateSnapshot.syndicates
          .filter(s => s.starterCount === 1)
          .length;

      case 'MULTIPLE':
        return this.activeSyndicateSnapshot.syndicates
          .filter(s => s.starterCount > 1)
          .length;

      case 'SOLE':
        return this.activeSyndicateSnapshot.soleStarters.length;

      default:
        return 0;
    }
  }

  getWinner = (player: string): PlayerWinner => {
    const reminder = this.activeMeeting.length > 0
      ? this.repo.findReminders().find(r => r.meeting === this.activeMeeting)
      : this.repo.findReminders()[0];

    if (reminder) {
      return reminder.winners.find(w => w.player === player) || DEFAULT_PLAYER_WINNER;
    }
    return DEFAULT_PLAYER_WINNER;
  }

  getCellValue = (player: string, meeting: string, key: string): string => {
    const meetings = this.meetings.filter(m => m.meeting == meeting);
    if (meetings.length !== 1) return '';

    const players = meetings[0].players.filter(p => p.player == player);
    if (players.length !== 1) {
      return ['engagements', 'earnings'].includes(key) ? 'X' : '';
    }

    // @ts-ignore
    const value = players[0][key]
    if (value == 0) {
      return ['engagements', 'earnings'].includes(key) ? 'X' : '';
    }
    return value.toString();
  }

  getStarters = (meeting: Meeting, race: number): EarningStarter[] => {
    return meeting.players
      .find(p => p.player === this.activePlayer)
      ?.starters
      .filter(s => s.race === race) || [];
  }

  getSectionStyle = (section: string): string =>
    [this.activePlayerType, this.activePlayerView].includes(section)
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

  isOnMostRecentRacecard = (code: string): boolean => {
    if (this.meetings.length < 1) return false;
    return this.meetings[0]
      .players
      .flatMap(p => p.starters)
      .map(s => s.horse)
      .includes(code);
  }

  isBoundaryMeeting = (meeting: string): boolean =>
    this.meetings
      .map(m => m.meeting.slice(0, 7))
      .filter((prefix, i, array) => array.indexOf(prefix) === i)
      .map(prefix => this.meetings
        .map(m => m.meeting)
        .filter(m => m.startsWith(prefix))
        .sort((m1, m2) => m1.localeCompare(m2))
        .shift()
      )
      .includes(meeting)

  isBoundaryPlayer = (player: string): boolean =>
    this.repo.findPlayers().find(p => p.code === player)?.boundary || false

  get activePersonViewByHorse(): HorseView[] {
    let view: HorseView[] = [];

    this.meetings
      .flatMap(m => m.players.filter(p => p.player === this.activePlayer && p.earnings > 0))
      .flatMap(ps => ps.starters)
      .filter(es => es?.placing >= 1 && es?.placing <= 4)
      .forEach(es => {
        const hView = view.find(v => v.horse === es.horse);
        if (!hView) {
          view.push({
            horse: es.horse,
            horseNameCH: es.horseNameCH,
            starters: [es]
          });
        } else {
          view.forEach(v => {
            if (v.horse === es.horse) {
              v.starters.push(es);
            }
          });
        }
      });

    view.forEach(v => v.starters.sort((s1, s2) => s1.placing - s2.placing));

    return view.sort((v1, v2) =>
      (v2.starters.filter(s => s?.placing === 1).length) - (v1.starters.filter(s => s?.placing === 1).length)
      ||
      (v2.starters.filter(s => s?.placing === 2).length) - (v1.starters.filter(s => s?.placing === 2).length)
      ||
      (v2.starters.filter(s => s?.placing === 3).length) - (v1.starters.filter(s => s?.placing === 3).length)
      ||
      (v2.starters.filter(s => s?.placing === 4).length) - (v1.starters.filter(s => s?.placing === 4).length)
      ||
      v2.horse.localeCompare(v1.horse)
    );
  }

  get maxActivePersonHorseTop4Count(): number {
    return this.activePersonViewByHorse
      .map(v => v.starters.length)
      .sort((h1, h2) => h1 - h2)
      .pop() || 1;
  }

  get activePlayerName(): string {
    const player = this.repo.findPlayers()
      .find(p => p.code === this.activePlayer);

    if (!player) return '';
    return `${player.lastName}, ${player.firstName}`;
  }

  get placings(): TablePlacing[] {
    return [
      {placing: 'W', key: 'wins', color: 'text-red-600', width: 'w-8'},
      {placing: 'Q', key: 'seconds', color: 'text-green-600', width: 'w-6'},
      {placing: 'P', key: 'thirds', color: 'text-blue-600', width: 'w-6'},
      {placing: 'F', key: 'fourths', color: 'text-purple-600', width: 'w-6'},
      {placing: 'E', key: 'engagements', color: '', width: 'w-8'},
      {placing: '$', key: 'earnings', color: '', width: 'w-12'},
    ]
  }

  get overviews(): MeetingOverview[] {
    return this.windowMeetings.map(m => {
        const title = `
          ${this.formatMeeting(m.meeting)}
          ${m.races}R $${m.turnover}
        `.trim();

        const date = m.meeting.replace(/-/g, '/');

        const link = `
          https://racing.hkjc.com/racing/information/
          English/Racing/ResultsAll.aspx?RaceDate=${date}
        `.replace(/\s/g, '');

        return {title: title, link: link, meeting: m.meeting}
      }
    )
  }

  get windowMeetings(): Meeting[] {
    return this.meetings.slice(
      this.meetingIndex, this.meetingIndex + MEETING_WINDOW_SIZE
    );
  }

  get controlStyle(): string {
    return `w-12 cursor-pointer transition hover:text-yellow-400`;
  }

  get syndicateKinds(): string[] {
    return ['SINGLE', 'MULTIPLE', 'SOLE'];
  }

  get playerViews(): string[] {
    return ['By Meeting', 'By Horse'];
  }

  get playerTypes(): string[] {
    return ['Trainers', 'Jockeys', 'Syndicates'];
  }

  get activeSyndicateSnapshot(): SyndicateSnapshot {
    const snapshot = this.activeMeeting.length > 0
      ? this.repo.findSyndicateSnapshots().find(ss => ss.meeting === this.activeMeeting)
      : this.repo.findSyndicateSnapshots()[0];

    return snapshot ? snapshot : DEFAULT_SYNDICATE_SNAPSHOT;
  }

  get players(): string[] {
    return this.activePlayerType === this.playerTypes[0]
      ? this.repo.findPlayers().filter(p => !p.jockey).map(p => p.code)
      : this.repo.findPlayers().filter(p => p.jockey).map(p => p.code);
  }

  get meetings(): Meeting[] {
    return this.repo.findMeetings();
  }
}
