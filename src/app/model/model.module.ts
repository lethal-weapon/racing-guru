import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

import {WebsocketService} from './websocket.service';
import {RestDataSource} from './rest.datasource';
import {RestRepository} from './rest.repository';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    WebsocketService,
    RestDataSource,
    RestRepository
  ]
})
export class ModelModule {
}
