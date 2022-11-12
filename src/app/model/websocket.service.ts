import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';

import {environment as env} from '../../environments/environment';
import {Racecard} from './racecard.model';

@Injectable()
export class WebsocketService {
  baseUrl: string;

  subject: AnonymousSubject<MessageEvent> | undefined;
  racecards: Subject<Racecard[]>;

  constructor() {
    this.baseUrl =
      `${env.WS_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/${env.WS_PREFIX}`;
    const racecardUrl = `${this.baseUrl}/racecards`;

    this.racecards = <Subject<Racecard[]>>this.connect(racecardUrl).pipe(
      map(
        (response: MessageEvent): Racecard[] => JSON.parse(response.data)
      )
    );
  }

  connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log(`Successfully connected: ${url}`);
    }
    return this.subject;
  }

  create(url: string): AnonymousSubject<MessageEvent> {
    let ws = new WebSocket(url);
    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      error: null,
      complete: null,
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    // @ts-ignore
    return new AnonymousSubject<MessageEvent>(observer, observable);
  }

}