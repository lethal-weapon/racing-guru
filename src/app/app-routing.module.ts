import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MeetingComponent} from './meeting/meeting.component';
import {RacecardComponent} from './racecard/racecard.component';
import {OddsComponent} from './odds/odds.component';
import {BacktestComponent} from './backtest/backtest.component';
import {FixtureComponent} from './fixture/fixture.component';
import {TrendComponent} from './trend/trend.component';
import {TrendEveryoneComponent} from './trend-everyone/trend-everyone.component';
import {TrendEarningComponent} from './trend-earning/trend-earning.component';
import {TrendCollaborationComponent} from './trend-collaboration/trend-collaboration.component';
import {TrendTopsComponent} from './trend-tops/trend-tops.component';
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

const routes: Routes = [
  {path: 'meeting', component: MeetingComponent},
  {path: 'racecard', component: RacecardComponent},
  {path: 'odds', component: OddsComponent},
  {path: 'backtest', component: BacktestComponent},
  {path: 'fixture', component: FixtureComponent},
  {
    path: 'trend',
    component: TrendComponent,
    children: [
      {
        path: '',
        component: TrendEveryoneComponent,
      },
      {
        path: 'everyone',
        component: TrendEveryoneComponent,
      },
      {
        path: 'tops',
        component: TrendTopsComponent,
      },
      {
        path: 'earning',
        component: TrendEarningComponent,
      },
      {
        path: 'collaboration',
        component: TrendCollaborationComponent,
      },
      {
        path: 'trackwork',
        component: TrendTrackworkComponent,
      },
      {
        path: 'draw',
        component: TrendDrawComponent,
      },
    ]
  },
  {
    path: 'form',
    component: FormComponent,
    children: [
      {
        path: '',
        component: FormReminderComponent,
      },
      {
        path: 'reminder',
        component: FormReminderComponent,
      },
      {
        path: 'owner',
        component: FormOwnerComponent,
      },
      {
        path: 'player',
        component: FormPlayerComponent,
      },
      {
        path: 'connection',
        component: FormConnectionComponent,
      },
      {
        path: 'bet',
        component: FormBetComponent,
      },
    ]
  },
  {
    path: 'finance',
    component: FinanceComponent,
    children: [
      {
        path: '',
        component: FinancePersonalComponent,
      },
      {
        path: 'personal',
        component: FinancePersonalComponent,
      },
      {
        path: 'accounting',
        component: FinanceAccountingComponent,
      },
    ]
  },
  {path: '**', component: MeetingComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
