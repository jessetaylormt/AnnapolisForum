import { Component, ViewChild, OnInit, QueryList} from '@angular/core';
import { Router } from '@angular/router';

import { ModalComponent } from './modal.component';
import { QueryService } from './query-service';
import { SearchParamsService } from './search-params-service';
import { CredentialsService } from './credentials-service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: `
      
    <div class="w3-top">
        <div class="w3-bar w3-padding w3-black">
            <a class="w3-btn w3-hover-white" routerLink="/index" routerLinkActive="active">Home</a>
            <a a routerLink="/new-thread" class="w3-btn w3-hover-white">Start A Thread</a>
            <span class="w3-btn w3-hover-white" (click)="onSearch()"> Search 
                <span><input class= "mt-input-search" (keyup.enter)="onSearch()" [(ngModel)]="searchParams" placeholder="query"/></span>
            </span>
            <span *ngIf="!loggedInUsername" (click)="showLogin()" class="w3-btn w3-hover-white">Log In</span>
              
            <div *ngIf="loggedInUsername" class="w3-hide-small w3-dropdown-hover w3-right mt-w3-btn-padding">
                <span class="mt-span-small"><i>logged in as {{this.loggedInUsername}}</i></span>     
                <div class="w3-dropdown-content w3-white">
                     <span (click)="onLogout()" class="mt-span-med w3-black w3-hover-white mt-width-100" >Log Out</span>
                </div>
            </div>

        </div>
    </div>
    <div class="w3-content mt-margins-wide" style="max-width:1400px;margin-top:80px;margin-bottom:80px">
        <router-outlet></router-outlet>
    </div>

    <my-modal #login name="login" (hidden)="clearLoginParams()">
        <span class="app-modal-header">
            Log in to post new content...
        </span>
        <div class="app-modal-body">
                <p><input class="w3-input w3-padding-16 w3-border" type="text" [(ngModel)]="username" placeholder="Username" required name="username"></p>
                <p><input class="w3-input w3-padding-16 w3-border" type="password" (keyup.enter)="onLogin()" [(ngModel)]="password" placeholder="Password" required name="password">
                    <label *ngIf="failedCredentials" class="w3-text-red">Could not verify your username or password!</label>
                </p>
        </div>
        <div class="app-modal-footer">
            <button class="w3-button w3-black" type="submit" (click)="onLogin()">LOGIN</button>
            <span class="w3-right">No username? <button (click)="showSignup()" class="w3-button w3-black">Sign Up</button></span>
        </div>
    </my-modal>

    <my-modal #signup name="signup" (hidden)="clearSignupParams()">
        <span class="app-modal-header">
            Create new User Account
        </span>
        <div class="app-modal-body">
                <p><input class="w3-input w3-padding-16 w3-border" type="text" [(ngModel)]="createUsername" placeholder="Username" required name="createUsername"></p>
                <label *ngIf="usernameError" class="w3-text-red">{{this.usernameError}}</label>
                <p><input class="w3-input w3-padding-16 w3-border" type="password" [(ngModel)]="createPassword1" placeholder="Password" required name="createPassword1"></p>
                <p><input class="w3-input w3-padding-16 w3-border" type="password" [(ngModel)]="createPassword2" placeholder="Confirm password" required name="createPassword2"></p>
                <label *ngIf="passwordMismatch" class="w3-text-red">Passwords do not match!</label>
                <p><input class="w3-input w3-padding-16 w3-border" type="text" [(ngModel)]="createEmail" placeholder="Email address" required name="createEmail"></p>
                <label>email is not required to sign up but is useful in the event you lose your password</label>
        </div>
        <div class="app-modal-footer">
            <button class="w3-button w3-black" type="submit" (click)="onSignup()">Submit</button>
            <span class="w3-right">Already have an account? <button (click)="showLogin()" class="w3-button w3-black">Log In</button></span>
        </div>
    </my-modal>


  `
})
export class AppComponent implements OnInit{
    searchParams: string = "";
    username: string = "";
    password: string = "";
    loggedInUsername: string = "";
    failedCredentials = false;

    createUsername: string = "";
    createPassword1: string = "";
    createPassword2: string = "";
    createEmail: string = "";
    passwordMismatch = false;
    usernameError = "";

    subscription: Subscription;

    @ViewChild("login") loginModal: ModalComponent;
    @ViewChild("signup") signupModal: ModalComponent;

    ngOnInit() {
        this.loggedInUsername = this.credentialsService.retrieveParams();
    }

    constructor(
        private queryService: QueryService,
        private searchParamsService: SearchParamsService,
        private credentialsService: CredentialsService,
        private router: Router) { 
            this.subscription = credentialsService.credentialsChange.subscribe((username) => {
                this.loggedInUsername = username;
            });
        }

    onSearch() {
        if(this.searchParams.length > 0) {
            this.searchParamsService.storeParams(this.searchParams);
            this.router.navigate(['/search-results']);
        }
    }
    onLogin() {
        this.queryService.postLogin(this.username, this.password)
                .then( userId => {
                    this.doLogin(userId);
                    this.loginModal.hide();
                })
                .catch(error => {
                    this.failedCredentials = true;
                    });
    }
    onLogout() {
        this.queryService.postLogout(this.loggedInUsername)
        .then( userId => {
            this.credentialsService.removeParams();
            this.loggedInUsername = null})
        .catch(error => {
                console.log('logout failed...');
            });
    }

    onSignup() {
        this.passwordMismatch = false;
        this.usernameError = "";
        if(this.createPassword1 != this.createPassword2) this.passwordMismatch = true;
        else if (this.createPassword1 && this.createUsername){
            this.queryService.postSignup(this.createUsername, this.createPassword1, this.createEmail)
                .then( userId => {
                    this.doLogin(userId);
                    this.signupModal.hide();
                })
                .catch(error => {
                    if(error == "That username already exists")
                        this.usernameError = "that username is taken!";
                    else if(error == "Invalid characters in username or password")
                        this.usernameError = "username and password may contain letters, numbers, and these characters: '$ - & @ .'";
                    else
                        alert(error);
                    });

        }
        else {
            this.usernameError = "username and password are both required!"
        }

        //attempt query submission (create queryService and Server-side functions)
        //Do Login OR notify user of problem
    }

    clearLoginParams() {
        this.username = "";
        this.password = "";
        this.failedCredentials = false;
    }
    clearSignupParams() {
        this.createUsername = "";
        this.createPassword1 = "";
        this.createPassword2 = "";
        this.createEmail = "";
        this.passwordMismatch = false;
        this.usernameError = "";
    }
    showSignup() {
        this.loginModal.hide();
        this.signupModal.show();
    }
    showLogin() {
        this.loginModal.show();
        this.signupModal.hide();
    }
    doLogin(userId) {
        this.credentialsService.storeParams(userId);
    }
}
