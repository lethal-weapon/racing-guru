import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html'
})
export class FinanceComponent implements OnInit {
  pages: Array<{ section: string, link: string }> = [
    {section: 'Personal', link: 'personal'},
    {section: 'Accounting', link: 'accounting'},
    // {section: 'Journal', link: 'journal'},
  ]

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  getSectionStyle = (link: string): string =>
    (this.currentUrl.endsWith(link))
    ||
    (this.currentUrl.endsWith('/finance') && link === 'personal')
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`

  get currentUrl(): string {
    return this.router.url;
  }
}
