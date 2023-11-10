import {Component} from '@angular/core';
import {WebsocketService} from './model/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'racing-guru';

  constructor(private socket: WebsocketService) {
  }
}