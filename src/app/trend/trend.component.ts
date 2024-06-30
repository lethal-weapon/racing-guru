import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {RestRepository} from '../model/rest.repository';
import {ONE_MINUTE} from '../util/numbers';

@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html'
})
export class TrendComponent implements OnInit {
  pages: Array<{ section: string, link: string }> = [
    {section: 'Everyone', link: 'everyone'},
    {section: 'Top Player', link: 'tops'},
    {section: 'Earning', link: 'earning'},
    {section: 'Draw Inheritance', link: 'draw'},
  ]

  constructor(
    private router: Router,
    private repo: RestRepository
  ) {
  }

  ngOnInit(): void {
    this.repo.fetchMeetings();
    this.repo.fetchReminders();
    this.repo.fetchActivePlayers();
    this.repo.fetchDrawInheritances();
    this.repo.fetchSyndicateSnapshots();

    setInterval(() => {
      this.repo.fetchLatestMeeting();
      this.repo.fetchLatestDrawInheritances();
      this.repo.fetchLatestSyndicateSnapshot();
    }, ONE_MINUTE);
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
      || this.repo.findDrawInheritances().length === 0
      || this.repo.findSyndicateSnapshots().length === 0;
  }
}
