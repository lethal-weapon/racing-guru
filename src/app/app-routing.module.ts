import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MeetingComponent} from './meeting/meeting.component';
import {RacecardComponent} from './racecard/racecard.component';
import {OddsComponent} from './odds/odds.component';
import {TrendComponent} from './trend/trend.component';
import {BacktestComponent} from './backtest/backtest.component';
import {FormComponent} from './form/form.component';
import {FormReminderComponent} from './form-reminder/form-reminder.component';
import {FormOwnerComponent} from './form-owner/form-owner.component';
import {FormPlayerComponent} from './form-player/form-player.component';
import {FormBetComponent} from './form-bet/form-bet.component';
import {FormFixtureComponent} from './form-fixture/form-fixture.component';

const routes: Routes = [
  {path: 'meeting', component: MeetingComponent},
  {path: 'racecard', component: RacecardComponent},
  {path: 'odds', component: OddsComponent},
  {path: 'trend', component: TrendComponent},
  {path: 'backtest', component: BacktestComponent},
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
        path: 'bet',
        component: FormBetComponent,
      },
      {
        path: 'fixture',
        component: FormFixtureComponent,
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
