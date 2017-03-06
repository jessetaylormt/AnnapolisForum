import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { AppComponent }         from './app.component';
import { ThreadIndexComponent }  from './thread-index.component';
import { ThreadSearchComponent }  from './thread-search.component';
import { ThreadListComponent }  from './thread-list.component';
import { ThreadViewComponent }  from './thread-view.component';
import { ThreadCreateComponent }  from './thread-create.component';
import { NotFoundComponent } from './not-found.component';
import { ModalComponent } from './modal.component';
import { QueryService }         from './query-service';
import { SearchParamsService }  from './search-params-service';
import { CredentialsService }  from './credentials-service';

import { AppRoutingModule }     from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    ThreadIndexComponent,
    ThreadSearchComponent,
    ThreadListComponent,
    ThreadViewComponent,
    ThreadCreateComponent,
    ModalComponent,
    NotFoundComponent
  ],
  providers: [ QueryService, SearchParamsService, CredentialsService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
