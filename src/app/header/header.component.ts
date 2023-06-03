import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TEN_SECONDS} from '../util/numbers';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  pages: Array<{ title: string, link: string }> = [
    {title: 'Meeting', link: '/'},
    {title: 'Racecard', link: '/racecard'},
    {title: 'Odds', link: '/odds'},
    {title: 'Trend', link: '/trend'},

    // {title: 'Top4s', link: '/top4s'},
    // {title: 'Matcher', link: '/matcher'},
    // {title: 'C11N', link: '/collaboration'},
    {title: 'People', link: '/people'},
  ]

  hour = 'HH';
  minute = 'MM';

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.tick();
    setInterval(() => this.tick(), TEN_SECONDS);
  }

  tick = () => {
    const d = new Date();
    const hours = d.getHours() % 12;
    const minutes = d.getMinutes();

    this.hour = hours ? `${hours}` : `12`;
    this.minute = minutes >= 10 ? `${minutes}` : `0${minutes}`;
  }

  get currentUrl(): string {
    return this.router.url;
  }
}