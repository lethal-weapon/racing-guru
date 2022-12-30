import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RacecardComponent} from './racecard/racecard.component';
import {EarningComponent} from './earning/earning.component';
import {PoolComponent} from './pool/pool.component';
import {PeopleComponent} from './people/people.component';
import {DividendComponent} from './dividend/dividend.component';
import {TrendComponent} from './trend/trend.component';
import {MatcherComponent} from './matcher/matcher.component';
import {CollaborationComponent} from './collaboration/collaboration.component';

const routes: Routes = [
  {path: 'racecard', component: RacecardComponent},
  {path: 'trend', component: TrendComponent},
  {path: 'dividend', component: DividendComponent},
  {path: 'matcher', component: MatcherComponent},
  {path: 'collaboration', component: CollaborationComponent},
  {path: 'earning', component: EarningComponent},
  {path: 'pool', component: PoolComponent},
  {path: 'people', component: PeopleComponent},
  {path: '**', component: RacecardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}