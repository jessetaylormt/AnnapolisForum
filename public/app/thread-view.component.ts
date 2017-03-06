import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';
import { Thread } from './thread';
import { Post } from './post';
import { QueryService } from './query-service';
import { CredentialsService } from './credentials-service';
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';


@Component({
  moduleId: module.id,
  selector: 'my-thread-view',
  template: `

<div *ngIf=posts >
  <h2 *ngIf=thread class="w3-center w3-padding-16"><b>{{thread.name}}</b></h2> 

  <div *ngFor="let post of posts; let isFirstPost = first">
    <div *ngIf="!isFirstPost" class="w3-card-4 w3-margin-top w3-margin-bottom mt-margin-left-48 w3-sand w3-hover-white w3-container w3-padding-4" >
        <p class="mt-ptext">{{post.text}} <i>-{{post.author}}, {{post.timestamp | date:'short'}}</i></p>
    </div>
    <div *ngIf="isFirstPost" class="w3-card-4 w3-margin mt-very-light-blue w3-hover-white w3-container w3-padding-4" >
        <p class="mt-ptext">{{post.text}} <i>-{{post.author}}, {{post.timestamp | date:'short'}}</i></p>
    </div>
  </div>

  
  <div *ngIf="!loggedInUsername" class="w3-center w3-text-red">Log in to post new content</div>
  <div *ngIf="loggedInUsername" class="w3-container w3-margin-top w3-margin-bottom mt-margin-left-48 w3-padding-4 mt-card-4">
    <span> <textarea class="mt-textarea-col" [(ngModel)]="newPostText" placeholder="type here..."></textarea> </span>
    <span><label class="mt-label-small w3-layout-top">-{{this.loggedInUsername}}</label></span>
    <span> <button class="w3-layout-top" (click)="postNewComment()">Post</button></span>
  </div>
</div>

  `,
  styleUrls: ['../w3-styles.css']
})

export class ThreadViewComponent implements OnInit{
    thread: Thread;
    posts: Post[];
    newPostText: string;
    subscription: Subscription;
    loggedInUsername: string = "";

    ngOnInit(): void {
      this.route.params
        .switchMap((params: Params) => this.queryService.getThread(+params['id']))
        .subscribe(thread => this.thread = thread);
      this.route.params
        .switchMap((params: Params) => this.queryService.getThreadPosts(+params['id']))
        .subscribe(posts => this.posts = posts);
        this.loggedInUsername = this.credentialsService.retrieveParams();
    }

    constructor(
      private queryService: QueryService,
      private credentialsService: CredentialsService,
      private route: ActivatedRoute,
      private location: Location) {
        this.subscription = credentialsService.credentialsChange.subscribe((username) => {
          this.loggedInUsername = username;
        });
      }

    postNewComment() {
      var newPost: Post = {text: this.newPostText, author:this.loggedInUsername, threadId: this.thread.id, timestamp: null };
      this.queryService.postNewPost(newPost, this.thread.id)
        .then((confirmedPost: Post) => this.successfulPost(confirmedPost));
    }

    successfulPost(newPost: Post) {
      this.newPostText = "";
      this.posts.push(newPost);
    }

    
}