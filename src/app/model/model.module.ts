import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

import {RestDataSource} from './rest.datasource';
import {RacecardRepository} from './racecard.repository';
import {MeetingRepository} from './meeting.repository';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    RestDataSource,
    RacecardRepository,
    MeetingRepository
  ]
})
export class ModelModule {
}