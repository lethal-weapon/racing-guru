import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {RestRepository} from '../model/rest.repository';
import {WebsocketService} from '../websocket.service';
import {Racecard} from '../model/racecard.model';
import {Recommendation} from '../model/recommendation.model';
import {LATEST} from '../util/strings';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  pages: Array<{ section: string, link: string }> = [
    {section: 'Intro', link: 'intro'},
    {section: 'Entry', link: 'entry'},
  ]

  constructor(
    private router: Router,
    private repo: RestRepository,
    private socket: WebsocketService
  ) {
    socket.addRecommendationCallback((newRecommendation: Recommendation) => {
      this.repo.updateRecommendationFromSocket(newRecommendation);
    });

    socket.addRacecardCallback((newCard: Racecard) => {
      this.repo.updateRacecardFromSocket(newCard);
    });
  }

  ngOnInit(): void {
    this.repo.fetchRacecards(LATEST, () => {
    });
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

  get isLoading(): boolean {
    return this.repo.findRacecards().length === 0;
  }
}
