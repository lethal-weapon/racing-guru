import {Injectable} from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

import {environment as env} from '../environments/environment';
import {THIRTY_SECONDS} from './util/numbers';
import {Pick} from './model/pick.model';
import {Racecard} from './model/racecard.model';
import {Recommendation} from './model/recommendation.model';
import {Meeting} from './model/meeting.model';
import {Collaboration} from './model/collaboration.model';
import {SyndicateSnapshot} from './model/syndicate.model';
import {TrackworkSnapshot} from './model/trackwork.model';

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

  recommendationTopic = '/topic/recommendation';
  onRecommendationCallbacks: ((newRecommendation: Recommendation) => any)[] = [];

  meetingTopic = '/topic/meeting';
  onMeetingCallbacks: ((newMeeting: Meeting) => any)[] = [];

  collaborationTopic = '/topic/collaboration';
  onCollaborationCallbacks: ((newCollaboration: Collaboration) => any)[] = [];

  syndicateSnapshotTopic = '/topic/syndicateSnapshot';
  onSyndicateSnapshotCallbacks: ((newSnapshot: SyndicateSnapshot) => any)[] = [];

  trackworkSnapshotTopic = '/topic/trackworkSnapshot';
  onTrackworkSnapshotCallbacks: ((newSnapshot: TrackworkSnapshot) => any)[] = [];

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

  addRecommendationCallback = (callback: (newRecommendation: Recommendation) => any) =>
    this.onRecommendationCallbacks.push(callback)

  addMeetingCallback = (callback: (newMeeting: Meeting) => any) =>
    this.onMeetingCallbacks.push(callback)

  addCollaborationCallback = (callback: (newCollaboration: Collaboration) => any) =>
    this.onCollaborationCallbacks.push(callback)

  addSyndicateSnapshotCallback = (callback: (newSnapshot: SyndicateSnapshot) => any) =>
    this.onSyndicateSnapshotCallbacks.push(callback)

  addTrackworkSnapshotCallback = (callback: (newSnapshot: TrackworkSnapshot) => any) =>
    this.onTrackworkSnapshotCallbacks.push(callback)

  connect = () => {
    let socket = new SockJS(this.socketUrl);
    this.client = Stomp.over(socket);
    this.client.connect(
      {},
      (frame: any) => {
        this.subscribeToPickTopic();
        this.subscribeToRacecardTopic();
        this.subscribeToRecommendationTopic();
        this.subscribeToMeetingTopic();
        this.subscribeToCollaborationTopic();
        this.subscribeToSyndicateSnapshotTopic();
        this.subscribeToTrackworkSnapshotTopic();
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

  subscribeToRecommendationTopic = () => {
    this.client.subscribe(this.recommendationTopic, (message: any) => {
      const newRecommendation = JSON.parse(message.body) as Recommendation;
      this.onRecommendationCallbacks.forEach(callback => callback(newRecommendation));
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

  subscribeToSyndicateSnapshotTopic = () => {
    this.client.subscribe(this.syndicateSnapshotTopic, (message: any) => {
      const newSnapshot = JSON.parse(message.body) as SyndicateSnapshot;
      this.onSyndicateSnapshotCallbacks.forEach(callback => callback(newSnapshot));
    });
  }

  subscribeToTrackworkSnapshotTopic = () => {
    this.client.subscribe(this.trackworkSnapshotTopic, (message: any) => {
      const newSnapshot = JSON.parse(message.body) as TrackworkSnapshot;
      this.onTrackworkSnapshotCallbacks.forEach(callback => callback(newSnapshot));
    });
  }
}
