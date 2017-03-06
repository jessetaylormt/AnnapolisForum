import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Thread } from './thread';
import { QueryService } from './query-service';
import { SearchParamsService } from './search-params-service';

@Component({
  moduleId: module.id,
  selector: 'my-thread-list',
  template: `

  <div class="w3-card-2 w3-margin w3-white" *ngFor="let thread of threads">

    <div class="w3-container w3-padding-4">
      <h4 class="w3-margin-0"><b>{{thread.name}} </b></h4>
      <p class="w3-margin-0 mt-ptext">{{thread.firstPost}}</p>
      <div class="w3-row">
        <div class="w3-col m4 s12">
          <p><button class="w3-btn w3-padding-small w3-white w3-border w3-hover-black" (click)="onSelect(thread)"><b>READ MORE »</b></button></p>
        </div>
        <div class="w3-col m8 w3-hide-small">
          <p><span class="w3-padding-small w3-right">
            <span>{{thread.author}} | </span>
            <span class="w3-opacity">{{thread.timestamp | date:'short'}} | </span>
            <span class="w3-tag">{{thread.size}} </span>
            <b>Total Posts</b></span></p>
        </div>
      </div>
    </div>

  </div>

  `,
  styleUrls: ['../w3-styles.css']
})
export class ThreadListComponent {
  @Input() threads: Thread[];
  selectedThread: Thread;

  constructor( private router: Router) { }

  onSelect(thread: Thread): void {
    this.selectedThread = thread;
    this.gotoDetail();
  }

  gotoDetail(): void {
    this.router.navigate(['/thread', this.selectedThread.id]);
  }
}