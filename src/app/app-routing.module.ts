import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RacecardComponent} from './racecard/racecard.component';
import {PerformanceComponent} from './performance/performance.component';
import {PoolComponent} from './pool/pool.component';

const routes: Routes = [
  {path: 'racecard', component: RacecardComponent},
  {path: 'performance', component: PerformanceComponent},
  {path: 'pools', component: PoolComponent},
  {path: '**', component: RacecardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
