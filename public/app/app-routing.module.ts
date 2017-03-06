import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThreadIndexComponent }      from './thread-index.component';
import { ThreadSearchComponent }      from './thread-search.component';
import { ThreadViewComponent }  from './thread-view.component';
import { ThreadCreateComponent }  from './thread-create.component';
import { NotFoundComponent } from './not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  { path: 'thread/:id', component: ThreadViewComponent },
  { path: 'index', component: ThreadIndexComponent },
  { path: 'search-results', component: ThreadSearchComponent },
  { path: 'new-thread', component: ThreadCreateComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}