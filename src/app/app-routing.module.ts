import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RacecardComponent} from './racecard/racecard.component';
import {EarningComponent} from './earning/earning.component';
import {PoolComponent} from './pool/pool.component';
import {PeopleComponent} from './people/people.component';
import {DividendComponent} from './dividend/dividend.component';
import {TrendComponent} from './trend/trend.component';

const routes: Routes = [
  {path: 'racecard', component: RacecardComponent},
  {path: 'dividend', component: DividendComponent},
  {path: 'earning', component: EarningComponent},
  {path: 'trend', component: TrendComponent},
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