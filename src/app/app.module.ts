import {NgModule} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {TooltipModule} from 'ng2-tooltip-directive';

import {AppRoutingModule} from './app-routing.module';
import {ModelModule} from './model/model.module';
import {AppComponent} from './app.component';
import {CounterDirective} from './directives/counter.directive';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {RacecardComponent} from './racecard/racecard.component';
import {PeopleComponent} from './people/people.component';
import {TrendComponent} from './trend/trend.component';
import {CollaborationComponent} from './collaboration/collaboration.component';
import {Top4sComponent} from './top4s/top4s.component';
import {MeetingComponent} from './meeting/meeting.component';
import {OddsComponent} from './odds/odds.component';
import {BacktestComponent} from './backtest/backtest.component';

@NgModule({
  declarations: [
    AppComponent,
    CounterDirective,
    HeaderComponent,
    FooterComponent,
    MeetingComponent,
    RacecardComponent,
    OddsComponent,
    TrendComponent,
    PeopleComponent,
    CollaborationComponent,
    Top4sComponent,
    BacktestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ModelModule,
    TooltipModule,
    NgOptimizedImage
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}