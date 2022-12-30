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
import {EarningComponent} from './earning/earning.component';
import {PoolComponent} from './pool/pool.component';
import {PeopleComponent} from './people/people.component';
import {DividendComponent} from './dividend/dividend.component';
import {TrendComponent} from './trend/trend.component';
import {MatcherComponent} from './matcher/matcher.component';
import {CollaborationComponent} from './collaboration/collaboration.component';

@NgModule({
  declarations: [
    AppComponent,
    CounterDirective,
    HeaderComponent,
    FooterComponent,
    RacecardComponent,
    EarningComponent,
    PoolComponent,
    PeopleComponent,
    DividendComponent,
    TrendComponent,
    MatcherComponent,
    CollaborationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ModelModule,
    TooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}