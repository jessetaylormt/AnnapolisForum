import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Thread } from './thread';
import { QueryService } from './query-service';
import { CredentialsService } from './credentials-service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'my-create-thread',
  template: `
<div>
  <h2 class="w3-center w3-padding-16"><b>Start a New Thread</b></h2> 

    <h5 *ngIf="!loggedInUsername" class="w3-center w3-text-red">Log in to be able to post new content!</h5>

    <div *ngIf="loggedInUsername" class="w3-container w3-margin w3-padding-4 mt-card-4">
        <span> <input class="mt-input-wide" [(ngModel)]="threadName" placeholder="Title of new thread"/> </span>
        <span><label class="mt-label-small w3-layout-top">-{{loggedInUsername}}</label></span>
        <span><button (click)="createThread()">Post</button></span>
        <div class="w3-margin-top">
             <textarea class="mt-textarea" [(ngModel)]="firstPost" placeholder="detailed post here..."></textarea>
        </div>
    </div>
</div>

  `,
  styleUrls: ['../w3-styles.css']
})

export class ThreadCreateComponent implements OnInit{
    threadName: string;
    firstPost: string;
    subscription: Subscription;
    loggedInUsername: string = "";

    constructor(
        private queryService: QueryService,
        private credentialsService: CredentialsService,
        private router: Router) {
            this.subscription = credentialsService.credentialsChange.subscribe((username) => {
            this.loggedInUsername = username;
            });
        }

    ngOnInit() {
        this.loggedInUsername = this.credentialsService.retrieveParams();
    }
    
    createThread() {
        if(this.threadName && this.firstPost && this.loggedInUsername) {
            var newThread: Thread = {name: this.threadName, author: this.loggedInUsername, firstPost: this.firstPost, 
                id: null, timestamp: null, size: null};
            this.queryService.postNewThread(newThread)
                .then( newThreadId => this.router.navigate(['/thread', newThreadId]) );
        }
    }
}

