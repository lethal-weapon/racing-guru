import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  pages: Array<{ section: string, link: string }> = [
    {section: 'Reminders', link: 'reminder'},
    {section: 'Owners', link: 'owner'},
    {section: 'Players', link: 'player'},
    {section: 'Connections', link: 'connection'},
    {section: 'Bets', link: 'bet'},
  ]

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  getSectionStyle = (link: string): string =>
    (this.currentUrl.endsWith(link))
    ||
    (this.currentUrl.endsWith('/form') && link === 'reminder')
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`

  get currentUrl(): string {
    return this.router.url;
  }
}
