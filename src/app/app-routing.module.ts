import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MeetingComponent} from './meeting/meeting.component';
import {RacecardComponent} from './racecard/racecard.component';
import {OddsComponent} from './odds/odds.component';
import {TrendComponent} from './trend/trend.component';
import {PeopleComponent} from './people/people.component';
import {CollaborationComponent} from './collaboration/collaboration.component';
import {Top4sComponent} from './top4s/top4s.component';
import {BacktestComponent} from './backtest/backtest.component';

const routes: Routes = [
  {path: 'meeting', component: MeetingComponent},
  {path: 'racecard', component: RacecardComponent},
  {path: 'trend', component: TrendComponent},
  {path: 'odds', component: OddsComponent},

  {path: 'backtest', component: BacktestComponent},
  {path: 'top4s', component: Top4sComponent},
  {path: 'collaboration', component: CollaborationComponent},
  {path: 'people', component: PeopleComponent},
  {path: '**', component: MeetingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}