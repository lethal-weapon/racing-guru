import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';

import {environment as env} from '../../environments/environment';
import {Racecard} from './racecard.model';
import {THIRTY_SECONDS} from '../util/numbers';

@Injectable()
export class WebsocketService {

  racecardUrl: string =
    `${env.WS_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/${env.WS_PREFIX}/racecards`;

  subject: AnonymousSubject<MessageEvent> | undefined;
  racecards: Subject<Racecard[]>;

  onCloseCallbacks: (() => any)[] = [];
  onReconnectCallbacks: (() => any)[] = [];

  constructor() {
    this.racecards = <Subject<Racecard[]>>this.connect(this.racecardUrl).pipe(
      map((response: MessageEvent): Racecard[] => JSON.parse(response.data))
    );
  }

  addCloseCallback = (callback: () => any) =>
    this.onCloseCallbacks.push(callback)

  addReconnectCallback = (callback: () => any) =>
    this.onReconnectCallbacks.push(callback)

  reconnect = () => {
    this.racecards = <Subject<Racecard[]>>this.connect(this.racecardUrl).pipe(
      map((response: MessageEvent): Racecard[] => JSON.parse(response.data))
    );
    this.onReconnectCallbacks.forEach(callback => callback());
  }

  connect = (url: string): AnonymousSubject<MessageEvent> => {
    this.subject = this.create(url);
    console.log(`Websocket connected: ${url}`);
    return this.subject;
  }

  create = (url: string): AnonymousSubject<MessageEvent> => {
    let ws = new WebSocket(url);

    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      // ws.onclose = obs.complete.bind(obs);

      ws.onclose = () => {
        console.log('Websocket closed, will retry in 30 seconds');
        this.onCloseCallbacks.forEach(callback => callback());
        setTimeout(() => this.reconnect(), THIRTY_SECONDS);
      }

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