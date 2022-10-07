import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  pages: Array<{ title: string, link: string }> = [
    {title: 'Racecard', link: '/'},
    {title: 'Tips', link: '/tips'},
    {title: 'Performance', link: '/performance'},
    {title: 'Pools', link: '/pools'},
  ]

  hour = 'HH';
  minute = 'MM';

  constructor() {
  }

  ngOnInit(): void {
    this.tick();
    setInterval(() => this.tick(), 10_000);
  }

  tick() {
    const d = new Date();
    const hours = d.getHours() % 12;
    const minutes = d.getMinutes();

    this.hour = hours ? `${hours}` : `12`;
    this.minute = minutes >= 10 ? `${minutes}` : `0${minutes}`;
  }

}
