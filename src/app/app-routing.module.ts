import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RacecardComponent} from './racecard/racecard.component';
import {PeopleComponent} from './people/people.component';
import {DividendComponent} from './dividend/dividend.component';
import {TrendComponent} from './trend/trend.component';
import {MatcherComponent} from './matcher/matcher.component';
import {CollaborationComponent} from './collaboration/collaboration.component';
import {Top4sComponent} from './top4s/top4s.component';
import {MeetingComponent} from './meeting/meeting.component';
import {OddsComponent} from './odds/odds.component';

const routes: Routes = [
  {path: 'meeting', component: MeetingComponent},
  {path: 'racecard', component: RacecardComponent},
  {path: 'odds', component: OddsComponent},
  {path: 'trend', component: TrendComponent},

  {path: 'dividend', component: DividendComponent},
  {path: 'top4s', component: Top4sComponent},
  {path: 'matcher', component: MatcherComponent},
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