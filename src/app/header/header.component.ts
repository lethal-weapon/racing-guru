import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FIVE_SECONDS} from '../util/numbers';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  pages: Array<{ title: string, link: string }> = [
    {title: 'Meeting', link: '/meeting'},
    {title: 'Racecard', link: '/racecard'},
    {title: 'Trend', link: '/trend'},
    {title: 'Odds', link: '/odds'},

    {title: 'Form', link: '/form'},
    {title: 'Backtest', link: '/backtest'},
    // {title: 'Top4s', link: '/top4s'},
    // {title: 'C11N', link: '/collaboration'},
  ]

  hour = 'HH';
  minute = 'MM';

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.tick();
    setInterval(() => this.tick(), FIVE_SECONDS);
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