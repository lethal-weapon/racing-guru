import {NgModule} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {TooltipModule} from 'ng2-tooltip-directive';

import {AppRoutingModule} from './app-routing.module';
import {ModelModule} from './model/model.module';
import {CounterDirective} from './directives/counter.directive';
import {TruncatePipe} from './directives/truncate.pipe';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {RacecardComponent} from './racecard/racecard.component';
import {TrendComponent} from './trend/trend.component';
import {CollaborationComponent} from './collaboration/collaboration.component';
import {MeetingComponent} from './meeting/meeting.component';
import {OddsComponent} from './odds/odds.component';
import {BacktestComponent} from './backtest/backtest.component';
import {SpinnerComponent} from './spinner/spinner.component';
import {FormComponent} from './form/form.component';
import {FormNoteComponent} from './form/form-note/form-note.component';
import {FormOwnerComponent} from './form/form-owner/form-owner.component';
import {FormBetComponent} from './form/form-bet/form-bet.component';
import {FormEngineComponent} from './form/form-engine/form-engine.component';
import {FormPeopleComponent} from './form/form-people/form-people.component';

@NgModule({
  declarations: [
    AppComponent,
    CounterDirective,
    TruncatePipe,
    HeaderComponent,
    FooterComponent,
    MeetingComponent,
    RacecardComponent,
    OddsComponent,
    TrendComponent,
    CollaborationComponent,
    BacktestComponent,
    SpinnerComponent,
    FormComponent,
    FormNoteComponent,
    FormOwnerComponent,
    FormBetComponent,
    FormEngineComponent,
    FormPeopleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ModelModule,
    TooltipModule,
    NgOptimizedImage,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}