import {Injectable} from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

import {environment as env} from '../environments/environment';
import {THIRTY_SECONDS} from './util/numbers';
import {Racecard} from './model/racecard.model';

@Injectable({providedIn: 'root'})
export class WebsocketService {

  client: any;
  socketUrl: string =
    `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.WS_SERVER_PORT}/socket-connect`;

  racecardTopic = '/topic/racecard';

  onCloseCallbacks: (() => any)[] = [];
  onReconnectCallbacks: (() => any)[] = [];
  onRacecardCallbacks: ((newCard: Racecard) => any)[] = [];

  constructor() {
    this.connect();
  }

  addCloseCallback = (callback: () => any) =>
    this.onCloseCallbacks.push(callback)

  addReconnectCallback = (callback: () => any) =>
    this.onReconnectCallbacks.push(callback)

  addRacecardCallback = (callback: (newCard: Racecard) => any) =>
    this.onRacecardCallbacks.push(callback)

  connect = () => {
    let socket = new SockJS(this.socketUrl);
    this.client = Stomp.over(socket);
    this.client.connect(
      {},
      (frame: any) => {
        this.subscribeToRacecardTopic();
      },
      (error: any) => {
        console.log('Websocket closed, will retry in 30 seconds');
        this.onCloseCallbacks.forEach(callback => callback());
        setTimeout(() => this.reconnect(), THIRTY_SECONDS);
      }
    );
  }

  reconnect = () => {
    this.connect();
    this.onReconnectCallbacks.forEach(callback => callback());
  }

  subscribeToRacecardTopic = () => {
    this.client.subscribe(this.racecardTopic, (message: any) => {
      const newCard = JSON.parse(message.body) as Racecard;
      this.onRacecardCallbacks.forEach(callback => callback(newCard));
    });
  }
}
