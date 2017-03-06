import { Component, OnInit } from '@angular/core';

import { ThreadListComponent } from './thread-list.component';
import { Thread } from './thread';
import { QueryService } from './query-service';

@Component({
  moduleId: module.id,
  selector: 'my-recent-threads',
  template: `
    <h2 class="w3-center">Recent Threads</h2>
    <my-thread-list [threads]=threads>
    </my-thread-list>
  `,
  styleUrls: ['../w3-styles.css']
})
export class ThreadIndexComponent implements OnInit {
  threads: Thread[];

  constructor(private queryService: QueryService) { }

  getRecentThreads(): void {
    this.queryService.getAllThreads().then(threads => this.threads = threads);
  }

  ngOnInit(): void {
      this.getRecentThreads();
  }
}