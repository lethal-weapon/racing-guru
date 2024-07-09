import {Injectable} from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

import {environment as env} from '../environments/environment';
import {THIRTY_SECONDS} from './util/numbers';
import {Pick} from './model/pick.model';
import {Racecard} from './model/racecard.model';
import {Meeting} from './model/meeting.model';
import {Collaboration} from './model/collaboration.model';

@Injectable({providedIn: 'root'})
export class WebsocketService {

  client: any;
  socketUrl: string =
    `${env.API_PROTOCOL}://${env.SERVER_HOSTNAME}:${env.WS_SERVER_PORT}/socket-connect`;

  onCloseCallbacks: (() => any)[] = [];
  onReconnectCallbacks: (() => any)[] = [];

  pickTopic = '/topic/pick';
  onPickCallbacks: ((newPick: Pick) => any)[] = [];

  racecardTopic = '/topic/racecard';
  onRacecardCallbacks: ((newCard: Racecard) => any)[] = [];

  meetingTopic = '/topic/meeting';
  onMeetingCallbacks: ((newMeeting: Meeting) => any)[] = [];

  collaborationTopic = '/topic/collaboration';
  onCollaborationCallbacks: ((newCollaboration: Collaboration) => any)[] = [];

  constructor() {
    this.connect();
  }

  addCloseCallback = (callback: () => any) =>
    this.onCloseCallbacks.push(callback)

  addReconnectCallback = (callback: () => any) =>
    this.onReconnectCallbacks.push(callback)

  addPickCallback = (callback: (newPick: Pick) => any) =>
    this.onPickCallbacks.push(callback)

  addRacecardCallback = (callback: (newCard: Racecard) => any) =>
    this.onRacecardCallbacks.push(callback)

  addMeetingCallback = (callback: (newMeeting: Meeting) => any) =>
    this.onMeetingCallbacks.push(callback)

  addCollaborationCallback = (callback: (newCollaboration: Collaboration) => any) =>
    this.onCollaborationCallbacks.push(callback)

  connect = () => {
    let socket = new SockJS(this.socketUrl);
    this.client = Stomp.over(socket);
    this.client.connect(
      {},
      (frame: any) => {
        this.subscribeToPickTopic();
        this.subscribeToRacecardTopic();
        this.subscribeToMeetingTopic();
        this.subscribeToCollaborationTopic();
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

  subscribeToPickTopic = () => {
    this.client.subscribe(this.pickTopic, (message: any) => {
      const newPick = JSON.parse(message.body) as Pick;
      this.onPickCallbacks.forEach(callback => callback(newPick));
    });
  }

  subscribeToRacecardTopic = () => {
    this.client.subscribe(this.racecardTopic, (message: any) => {
      const newCard = JSON.parse(message.body) as Racecard;
      this.onRacecardCallbacks.forEach(callback => callback(newCard));
    });
  }

  subscribeToMeetingTopic = () => {
    this.client.subscribe(this.meetingTopic, (message: any) => {
      const newMeeting = JSON.parse(message.body) as Meeting;
      this.onMeetingCallbacks.forEach(callback => callback(newMeeting));
    });
  }

  subscribeToCollaborationTopic = () => {
    this.client.subscribe(this.collaborationTopic, (message: any) => {
      const newCollaboration = JSON.parse(message.body) as Collaboration;
      this.onCollaborationCallbacks.forEach(callback => callback(newCollaboration));
    });
  }
}
