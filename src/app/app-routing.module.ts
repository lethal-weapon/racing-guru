import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MeetingComponent} from './meeting/meeting.component';
import {RacecardComponent} from './racecard/racecard.component';
import {OddsComponent} from './odds/odds.component';
import {TrendComponent} from './trend/trend.component';
import {FormComponent} from './form/form.component';
import {BacktestComponent} from './backtest/backtest.component';

const routes: Routes = [
  {path: 'meeting', component: MeetingComponent},
  {path: 'racecard', component: RacecardComponent},
  {path: 'odds', component: OddsComponent},
  {path: 'trend', component: TrendComponent},
  {path: 'form', component: FormComponent},
  {path: 'backtest', component: BacktestComponent},
  {path: '**', component: MeetingComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
