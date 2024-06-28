import {Component, OnInit} from '@angular/core';
import {WebsocketService} from '../../model/websocket.service';

@Component({
  selector: 'app-toast-websocket',
  templateUrl: './toast-websocket.component.html'
})
export class ToastWebsocketComponent implements OnInit {

  timeToReconnect: number = 30;
  animationStyle: string = `invisible`;
  countDownIntervalId: any;

  constructor(private socket: WebsocketService) {
    socket.addCloseCallback(() => {
      this.timeToReconnect = 30;
      this.animationStyle = `animate__animated animate__fadeInUp animate__slow`;
      this.countDownIntervalId = setInterval(() => {
        if (this.timeToReconnect > 0) this.timeToReconnect -= 1;
      }, 1_000);
    });

    socket.addReconnectCallback(() => {
      this.animationStyle = `animate__animated animate__fadeOutDown animate__slow`;
      if (this.countDownIntervalId) clearInterval(this.countDownIntervalId);
    });
  }

  ngOnInit(): void {
  }
}
