import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  pages: Array<{ title: string, link: string }> = [
    {title: 'Racecard', link: '/'},
    {title: 'Trend', link: '/trend'},
    {title: 'Dividend', link: '/dividend'},
    {title: 'Matcher', link: '/matcher'},
    {title: 'C11N', link: '/collaboration'},
    {title: 'Earning', link: '/earning'},
    {title: 'Pool', link: '/pool'},
    {title: 'People', link: '/people'},
  ]

  hour = 'HH';
  minute = 'MM';

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.tick();
    setInterval(() => this.tick(), 10_000);
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