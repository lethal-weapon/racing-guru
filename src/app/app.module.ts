import {NgModule} from '@angular/core';
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
import {MatcherComponent} from './matcher/matcher.component';
import {CollaborationComponent} from './collaboration/collaboration.component';
import {Top4sComponent} from './top4s/top4s.component';
import {MeetingComponent} from './meeting/meeting.component';
import {OddsComponent} from './odds/odds.component';
import {NgOptimizedImage} from "@angular/common";
import { EngineComponent } from './engine/engine.component';

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
    MatcherComponent,
    CollaborationComponent,
    Top4sComponent,
    EngineComponent
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