import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  pages: Array<{ section: string, link: string }> = [
    {section: 'Intro', link: 'intro'},
    {section: 'Entry', link: 'entry'},
  ]

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  getSectionStyle = (link: string): string =>
    (this.currentUrl.endsWith(link))
    ||
    (this.currentUrl.endsWith('/game') && link === 'intro')
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`

  get currentUrl(): string {
    return this.router.url;
  }
}
