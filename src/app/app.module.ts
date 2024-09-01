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
import {SpinnerComponent} from './spinner/spinner.component';
import {WebsocketService} from './websocket.service';
import {ToastWebsocketComponent} from './toast-websocket/toast-websocket.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {MeetingComponent} from './meeting/meeting.component';
import {RacecardComponent} from './racecard/racecard.component';
import {OddsComponent} from './odds/odds.component';
import {BacktestComponent} from './backtest/backtest.component';
import {FixtureComponent} from './fixture/fixture.component';
import {TrendComponent} from './trend/trend.component';
import {TrendEveryoneComponent} from './trend-everyone/trend-everyone.component';
import {TrendTopsComponent} from './trend-tops/trend-tops.component';
import {TrendEarningComponent} from './trend-earning/trend-earning.component';
import {TrendCollaborationComponent} from './trend-collaboration/trend-collaboration.component';
import {TrendTrackworkComponent} from './trend-trackwork/trend-trackwork.component';
import {TrendDrawComponent} from './trend-draw/trend-draw.component';
import {FormComponent} from './form/form.component';
import {FormReminderComponent} from './form-reminder/form-reminder.component';
import {FormOwnerComponent} from './form-owner/form-owner.component';
import {FormPlayerComponent} from './form-player/form-player.component';
import {FormConnectionComponent} from './form-connection/form-connection.component';
import {FormBetComponent} from './form-bet/form-bet.component';
import {FinanceComponent} from './finance/finance.component';
import {FinancePersonalComponent} from './finance-personal/finance-personal.component';
import {FinanceAccountingComponent} from './finance-accounting/finance-accounting.component';

@NgModule({
  declarations: [
    AppComponent,
    CounterDirective,
    TruncatePipe,
    SpinnerComponent,
    ToastWebsocketComponent,
    HeaderComponent,
    FooterComponent,
    MeetingComponent,
    RacecardComponent,
    OddsComponent,
    BacktestComponent,
    FixtureComponent,
    TrendComponent,
    TrendEveryoneComponent,
    TrendEarningComponent,
    TrendTopsComponent,
    TrendCollaborationComponent,
    TrendTrackworkComponent,
    TrendDrawComponent,
    FormComponent,
    FormReminderComponent,
    FormOwnerComponent,
    FormPlayerComponent,
    FormConnectionComponent,
    FormBetComponent,
    FinanceComponent,
    FinancePersonalComponent,
    FinanceAccountingComponent,
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
  providers: [
    WebsocketService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
