import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Interview} from '../../model/dto.model';
import {Fine, Report} from '../../model/report.model';
import {StarterChange} from '../../model/starter.model';
import {PlayerBirthday, PlayerWinner, Reminder} from '../../model/reminder.model';
import {JOCKEYS, TRAINERS} from '../../model/player.model';
import {TEN_THOUSAND, TWO_SECONDS} from '../../util/numbers';
import {SEASONS} from '../../util/strings';

@Component({
  selector: 'app-form-note',
  templateUrl: './form-note.component.html'
})
export class FormNoteComponent implements OnInit {
  activeMeeting: string = '';
  reportIndex: number = 0;
  meetingIndex: number = 0;

  interviews: Interview[] = [];
  isSavingInterview: boolean = false;
  isInterviewFailToSave: boolean = false;
  isInterviewSuccessToSave: boolean = false;

  protected readonly TEN_THOUSAND = TEN_THOUSAND;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchReminders();
    this.repo.fetchReports();
    this.repo.fetchMeetings();
    this.repo.fetchRacecards('latest', () => {
      this.activeMeeting = this.repo.findRacecards()
        .map(r => r.meeting)
        .pop() || '2023-09-10';
      this.initializeInterview();
    });
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  formatBirthday = (date: string): string => {
    const birthday = new Date(date);
    const month = birthday.toLocaleString('en-US', {month: 'short'});
    return `${month} ${birthday.getDate()}`;
  }

  formatFineTooltip = (fine: Fine): string => {
    const race = fine?.race ? `R#${fine.race}` : ``;
    const horse = fine?.horse ? `${fine.horse} // ` : ``;
    return `${race} ${horse} ${fine.reason}`;
  }

  setActiveMeeting = (meeting: string) => {
    if (meeting === this.activeMeeting) return;

    this.activeMeeting = meeting;
    this.repo.fetchRacecards(meeting, () => this.initializeInterview());
  }

  initializeInterview = () => {
    this.interviews = [];
    this.repo.findRacecards().forEach(r => {
      r.starters.forEach(s => {
        if (s.interviewed) {
          this.interviews.push({
            meeting: r.meeting,
            race: r.race,
            order: s.order,
            interviewee: s?.interviewee || ''
          });
        }
      });
    });
    this.interviews.sort((i1, i2) => i1.race - i2.race || i1.order - i2.order);
  }

  deleteInterview = (interview: Interview) => {
    if (this.isOnlyOneInterviewLeft) return;
    this.interviews = this.interviews.filter(i => i !== interview);
  }

  addInterview = () => {
    const largestRace =
      this.interviews.map(i => i.race).sort((r1, r2) => r1 - r2).pop() || 1;

    const race = largestRace < this.maxRace
      ? largestRace + 1
      : largestRace;

    const usedOrders = this.interviews
      .filter(i => i.race === race)
      .map(i => i.order);

    const order = Array(6)
      .fill(1)
      .map((_, index) => 1 + index)
      .filter(o => !usedOrders.includes(o))
      .shift() || 1;

    this.interviews.push({
      meeting: this.activeMeeting,
      race: race,
      order: order,
      interviewee: this.getPossibleInterviewees(race, order)[0]
    });
  }

  populateInterview = () => {
    if (this.interviews.length > 0) return;
    for (let race = this.maxRace - 4; race <= this.maxRace; race++)
      this.interviews.push({
        meeting: this.activeMeeting,
        race: race,
        order: 1,
        interviewee: this.getPossibleInterviewees(race, 1)[0]
      });
  }

  saveInterview = () => {
    if (this.isProcessingInterview || !this.isValidInterview) return;

    this.isSavingInterview = true;
    this.repo.saveInterview(
      this.interviews,
      () => {
        this.initializeInterview();
        this.isSavingInterview = false;
        this.isInterviewSuccessToSave = true;
        setTimeout(() => this.isInterviewSuccessToSave = false, TWO_SECONDS);
      },
      () => {
        this.isSavingInterview = false;
        this.isInterviewFailToSave = true;
        setTimeout(() => this.isInterviewFailToSave = false, TWO_SECONDS);
      }
    );
  }

  updateInterviewee = (interview: Interview) =>
    interview.interviewee = this.getPossibleInterviewees(interview.race, interview.order)[0];

  getPossibleInterviewees = (race: number, order: number): string[] => {
    const starter = this.repo.findRacecards()
      .find(r => r.race === race)
      ?.starters
      .find(s => s.order === order);

    return starter
      ? [starter.jockey, starter.trainer]
      : JOCKEYS.concat(TRAINERS).map(p => p.code);
  }

  getPossibleOrders = (race: number, order: number): number[] =>
    this.repo.findRacecards()
      .find(r => r.race === race)
      ?.starters
      .map(s => s.order)
      .filter(o => o === order || !this.interviews
        .filter(i => i.race === race)
        .map(i => i.order)
        .includes(o)
      )
      .sort((o1, o2) => o1 - o2)
    || Array(14).fill(1).map((_, index) => 1 + index);

  getMeetingIndex = (meeting: string): number => {
    for (const season of SEASONS) {
      if (meeting >= season.opening && meeting <= season.finale) {
        return 1 + this.meetings
          .filter(m => m >= season.opening && m <= season.finale)
          .sort((m1, m2) => m1.localeCompare(m2))
          .indexOf(meeting);
      }
    }
    return 0;
  }

  getBadgeStyle = (render: string): string =>
    this.activeMeeting === render
      ? `text-yellow-400 border-yellow-400`
      : `border-gray-600 hover:border-yellow-400`

  shiftReport = (length: number) => {
    const ws = this.reportWindowSize;
    const maxIndex = this.reports.length - ws;

    switch (length) {
      case -99:
        this.reportIndex = 0;
        break;
      case 99:
        this.reportIndex = maxIndex;
        break;
      case -this.meetingWindowSize:
        if (this.reportIndex >= ws) this.reportIndex -= ws;
        else this.reportIndex = 0;
        break;
      case this.meetingWindowSize:
        if (this.reportIndex < maxIndex - ws) this.reportIndex += ws;
        else this.reportIndex = maxIndex;
        break;
    }
  }

  shiftMeeting = (length: number) => {
    const ws = this.meetingWindowSize;
    const maxIndex = this.meetings.length - ws;

    switch (length) {
      case -99:
        this.meetingIndex = 0;
        break;
      case 99:
        this.meetingIndex = maxIndex;
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

  get starterChanges(): StarterChange[] {
    return this.repo.findRacecards()
      .map(r => r.changes.map(c => {
          c.race = r.race;
          return c;
        })
      )
      .reduce((prev, curr) => prev.concat(curr), [])
      .sort((sc1, sc2) => ((sc1?.race || 1) - (sc2?.race || 1)) || (sc1.order || sc2.order))
  }

  get playerReachedMilestone(): PlayerWinner[] {
    return this.meetingReminder.winners.filter(pw => pw.isReachedMilestone)
  }

  get playerCloseMilestone(): PlayerWinner[] {
    return this.meetingReminder.winners.filter(pw => pw.isCloseToMilestone)
  }

  get playerBirthdays(): PlayerBirthday[] {
    return this.meetingReminder.birthdays;
  }

  get meetingReminder(): Reminder {
    // @ts-ignore
    return this.repo.findReminders()
      .find(n => n.meeting === this.activeMeeting);
  }

  get isValidInterview(): boolean {
    if (this.interviews.length === 0) return false;

    for (let i = 0; i < this.interviews.length - 1; i++)
      for (let j = i + 1; j < this.interviews.length; j++)
        if (
          this.interviews[i].race === this.interviews[j].race &&
          this.interviews[i].order === this.interviews[j].order
        )
          return false;

    return true;
  }

  get isOnlyOneInterviewLeft(): boolean {
    return this.interviews.length === 1;
  }

  get isProcessingInterview(): boolean {
    return this.isSavingInterview
      || this.isInterviewFailToSave
      || this.isInterviewSuccessToSave;
  }

  get maxRace(): number {
    return this.repo.findRacecards()
      .map(r => r.race)
      .sort((r1, r2) => r1 - r2)
      .pop() || 11;
  }

  get paginationControls(): Array<{ icon: string, length: number }> {
    return [
      {icon: 'fa fa-2x fa-long-arrow-left', length: -99},
      {icon: 'fa fa-2x fa-angle-double-left', length: -this.meetingWindowSize},
      {icon: 'fa fa-2x fa-angle-double-right', length: this.meetingWindowSize},
      {icon: 'fa fa-2x fa-long-arrow-right', length: 99},
    ]
  }

  get windowReports(): Report[] {
    return this.reports
      .slice(this.reportIndex, this.reportIndex + this.reportWindowSize);
  }

  get windowMeetings(): string[] {
    return this.meetings
      .slice(this.meetingIndex, this.meetingIndex + this.meetingWindowSize);
  }

  get reportWindowSize(): number {
    return 6;
  }

  get meetingWindowSize(): number {
    return 12;
  }

  get reports(): Report[] {
    return this.repo.findReports()
      .filter(r => r.meeting <= this.activeMeeting)
      .filter(r => r.fines.length > 0 || r.suspensions.length > 0);
  }

  get meetings(): string[] {
    return this.repo.findMeetings().map(m => m.meeting);
  }
}