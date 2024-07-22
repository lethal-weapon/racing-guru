import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {RestRepository} from '../model/rest.repository';
import {WebsocketService} from '../websocket.service';
import {Meeting} from '../model/meeting.model';
import {SyndicateSnapshot} from '../model/syndicate.model';

@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html'
})
export class TrendComponent implements OnInit {
  pages: Array<{ section: string, link: string }> = [
    {section: 'Everyone', link: 'everyone'},
    {section: 'Board', link: 'tops'},
    {section: 'Earning', link: 'earning'},
    {section: 'Collaboration', link: 'collaboration'},
    {section: 'Draw', link: 'draw'},
  ]

  constructor(
    private router: Router,
    private repo: RestRepository,
    private socket: WebsocketService
  ) {
    socket.addMeetingCallback((newMeeting: Meeting) => {
      this.repo.updateMeetingFromSocket(newMeeting);
    });

    socket.addSyndicateSnapshotCallback((newSnapshot: SyndicateSnapshot) => {
      this.repo.updateSyndicateSnapshotFromSocket(newSnapshot);
    });
  }

  ngOnInit(): void {
    this.repo.fetchActivePlayers();
    this.repo.fetchMeetings(16);
    this.repo.fetchReminders(16);
    this.repo.fetchSyndicateSnapshots(16);
  }

  getSectionStyle = (link: string): string =>
    (this.currentUrl.endsWith(link))
    ||
    (this.currentUrl.endsWith('/trend') && link === 'everyone')
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

  get currentUrl(): string {
    return this.router.url;
  }

  get isLoading(): boolean {
    return this.repo.findPlayers().length === 0
      || this.repo.findMeetings().length === 0
      || this.repo.findReminders().length === 0
      || this.repo.findSyndicateSnapshots().length === 0;
  }
}
