import {NgModule} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {TooltipModule} from 'ng2-tooltip-directive';
import {NgxChartsModule} from '@swimlane/ngx-charts';

import {AppRoutingModule} from './app-routing.module';
import {ModelModule} from './model/model.module';
import {CounterDirective} from './directives/counter.directive';
import {TruncatePipe} from './directives/truncate.pipe';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {RacecardComponent} from './racecard/racecard.component';
import {TrendComponent} from './trend/trend.component';
import {MeetingComponent} from './meeting/meeting.component';
import {OddsComponent} from './odds/odds.component';
import {BacktestComponent} from './backtest/backtest.component';
import {SpinnerComponent} from './spinner/spinner.component';
import {FormComponent} from './form/form.component';
import {FormReminderComponent} from './form-reminder/form-reminder.component';
import {FormOwnerComponent} from './form-owner/form-owner.component';
import {FormBetComponent} from './form-bet/form-bet.component';
import {FormEngineComponent} from './form-engine/form-engine.component';
import {FormPlayerComponent} from './form-player/form-player.component';
import {FormConnectionComponent} from './form-connection/form-connection.component';
import {FormFixtureComponent} from './form-fixture/form-fixture.component';
import {ToastWebsocketComponent} from './toast/toast-websocket/toast-websocket.component';
import {EarningComponent} from './earning/earning.component';

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
    BacktestComponent,
    SpinnerComponent,
    FormComponent,
    FormReminderComponent,
    FormOwnerComponent,
    FormPlayerComponent,
    FormBetComponent,
    FormFixtureComponent,
    FormEngineComponent,
    FormConnectionComponent,
    ToastWebsocketComponent,
    EarningComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ModelModule,
    TooltipModule,
    NgOptimizedImage,
    FormsModule,
    NgxChartsModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
