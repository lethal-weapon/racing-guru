import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RacecardComponent} from './racecard/racecard.component';
import {EarningComponent} from './earning/earning.component';
import {PoolComponent} from './pool/pool.component';
import {PeopleComponent} from './people/people.component';

const routes: Routes = [
  {path: 'racecard', component: RacecardComponent},
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