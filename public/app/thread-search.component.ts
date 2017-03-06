import { Component, OnInit } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';

import { ThreadListComponent } from './thread-list.component';
import { Thread } from './thread';
import { QueryService } from './query-service';
import { SearchParamsService } from './search-params-service';

@Component({
  moduleId: module.id,
  selector: 'my-searched-threads',
  template: `
    <h2 class="w3-center">Search Results</h2>
    <h6 id="nothingFoundNote" class="mt-notify-missing w3-center w3-text-red">NO threads found matching all searched words</h6>
    <my-thread-list [threads]=threads>
    </my-thread-list>
  `,
  styleUrls: ['../w3-styles.css']
})
export class ThreadSearchComponent implements OnInit {
  threads: Thread[];
  subscription: Subscription;

  constructor(
    private queryService: QueryService,
    private searchParamsService: SearchParamsService) {
      this.subscription = searchParamsService.paramChange.subscribe((queryArray) => {
        this.getSearchedThreads(queryArray);
      });
     }

  getSearchedThreads(searchParams: string[]): void {
    this.queryService.getSearchedThreads(searchParams)
      .then(threads => {
        this.threads = threads;
        if(threads.length == 0) document.getElementById("nothingFoundNote").style.display = "block";
        else document.getElementById("nothingFoundNote").style.display = "none";
      });
  }

  ngOnInit(): void {
      this.getSearchedThreads(this.searchParamsService.retrieveParams());
      this.searchParamsService.clearParams(); //need to verify if this line is necessary
  }
}