import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {Interview} from '../../model/dto.model';
import {Report, Fine} from '../../model/report.model';
import {StarterChange} from '../../model/starter.model';
import {PersonWinner, PersonBirthday} from '../../model/note.model';
import {JOCKEYS, TRAINERS} from '../../model/person.model';
import {ONE_DAY_MILL, TEN_THOUSAND, TWO_SECONDS} from '../../util/numbers';
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
    this.repo.fetchNotes();
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
      .map((e, index) => 1 + index)
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
    || Array(14).fill(1).map((e, index) => 1 + index);

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

  saveNotes = () => {
    const note = this.repo.findNotes().find(n => n.meeting === this.activeMeeting);
    if (note) {
      this.repo.saveNote({
        ...note,
        birthdays: this.personBirthdays,
        blacklist: this.personMilestonePassWinners,
        whitelist: this.personMilestoneCloseWinners,
      });
    } else {
      this.repo.saveNote({
        meeting: this.activeMeeting,
        birthdays: this.personBirthdays,
        blacklist: this.personMilestonePassWinners,
        whitelist: this.personMilestoneCloseWinners,
        starvation: []
      });
    }
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

  get personBirthdays(): PersonBirthday[] {
    return JOCKEYS.concat(TRAINERS).map(person => {
      const birthYear = person.dateOfBirth.slice(0, 4);
      const activeYear = this.activeMeeting.slice(0, 4);
      const age = parseInt(activeYear) - parseInt(birthYear);

      const birthMonthDay = person.dateOfBirth.slice(5);
      const thisBirthday = `${activeYear}-${birthMonthDay}`;
      return {
        person: person.code,
        date: thisBirthday,
        age: age
      }
    })
      .filter(pb => {
        if (this.activeMeeting === pb.date) return true;

        const meeting = new Date(this.activeMeeting).getTime();
        const birthday = new Date(pb.date).getTime();
        const diffDays = (birthday - meeting) / ONE_DAY_MILL;

        return diffDays >= -7 && diffDays <= 21;
      })
      .sort((pb1, pb2) =>
        pb1.date.localeCompare(pb2.date) || pb2.age - pb1.age
      );
  }

  get personMilestonePassWinners(): PersonWinner[] {
    return this.personWinners.filter(pw =>
      (pw.career > 0 && pw.career % 10 === 0)
    );
  }

  get personMilestoneCloseWinners(): PersonWinner[] {
    return this.personWinners.filter(pw =>
      (pw.career === 0) || (pw.career % 10 >= 8) || (pw.season % 10 >= 9)
    );
  }

  get personWinners(): PersonWinner[] {
    return JOCKEYS.concat(TRAINERS)
      .filter(person =>
        (this.repo.findMeetings().find(m => m.meeting === this.activeMeeting)?.persons || [])
          .map(ps => ps.person)
          .includes(person.code)
      )
      .map(person => {
        let seasonWins = 0;
        for (const season of SEASONS) {
          if (this.activeMeeting >= season.opening && this.activeMeeting <= season.finale) {
            if (this.activeMeeting === season.opening) break;

            seasonWins = this.repo.findMeetings()
              .filter(m => m.meeting >= season.opening && m.meeting < this.activeMeeting)
              .flatMap(m => m.persons)
              .filter(ps => ps.person === person.code)
              .map(ps => ps.wins)
              .reduce((prev, curr) => prev + curr, 0);

            break;
          }
        }

        const careerWins = this.repo.findMeetings()
          .filter(m => m.meeting < this.activeMeeting)
          .flatMap(m => m.persons)
          .filter(ps => ps.person === person.code)
          .map(ps => ps.wins)
          .reduce((prev, curr) => prev + curr, person.careerWins);

        return {
          person: person.code,
          season: seasonWins,
          career: careerWins
        }
      })
      .sort((p1, p2) =>
        (p2.career - p1.career) || (p2.season - p1.season)
      );
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