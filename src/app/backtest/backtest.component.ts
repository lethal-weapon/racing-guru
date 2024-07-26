import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-backtest',
  templateUrl: './backtest.component.html'
})
export class BacktestComponent implements OnInit {
  pages: Array<{ section: string, link: string }> = [
    {section: 'General Chance', link: 'general'},
    {section: 'Exact Chance', link: 'exact'},
  ]

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  getSectionStyle = (link: string): string =>
    (this.currentUrl.endsWith(link))
    ||
    (this.currentUrl.endsWith('/backtest') && link === 'general')
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

  get currentUrl(): string {
    return this.router.url;
  }
}
