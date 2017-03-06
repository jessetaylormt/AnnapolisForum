////
//THIS COMPONENET WAS TEMPORARILY RETIRED. SOURCE CODE RETAINED UNTIL FUTURE UPGRADES CAN BE IMPLEMENTED
////

import { Component } from '@angular/core';

//this was a bit unneccesarily complex for a single instance, but it is reusable
@Component({
  selector: 'my-modal',
  template: `
  <div class="mt-modal fade" tabindex="-1" [ngClass]="{'in': visibleAnimate}"
       [ngStyle]="{'display': visible ? 'block' : 'none', 'opacity': visibleAnimate ? 1 : 0}">
    <div class="w3-modal-content mt-width-450">
      <div class="w3-border">
        <div class="w3-container w3-padding-8 w3-black">
          <ng-content select=".app-modal-header" class="w3-col.s11"></ng-content><span (click)="hide()" class="w3-col.s1 w3-closebtn w3-hover-text-grey">x</span>
        </div>
        <div class="w3-container w3-padding-8">
          <ng-content select=".app-modal-body"></ng-content>
        </div>
        <div class="w3-container w3-padding-8">
          <ng-content select=".app-modal-footer"></ng-content>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ModalComponent {

  public visible = false;
  private visibleAnimate = false;

  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true);
  }

  public hide(): void {
    //need to find a way to clear form data from parent component. Could do this by binding them into here from parent.
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }
}


//Use with the following for transclusion - 
    // <my-modal>
    //     <span class="app-modal-header">
    //         Log in to post new content...
    //     </span>
    //     <div class="app-modal-body">
    //         <form action="/action_page.php" target="_blank">
    //             <p><input class="w3-input w3-padding-16 w3-border" type="text" [(ngModel)]="username" placeholder="Username" required name="username"></p>
    //             <p><input class="w3-input w3-padding-16 w3-border" type="password" (keyup.enter)="onLogin()" [(ngModel)]="password" placeholder="Password" required name="password">
    //                 <label *ngIf="failedCredentials" class="w3-text-red">Could not verify your username or password!</label>
    //             </p>
    //         </form>
    //     </div>
    //     <div class="app-modal-footer">
    //         <button class="w3-button w3-black" type="submit" (click)="onLogin()">LOGIN</button>
    //         <span class="w3-right">No username? <button class="w3-button w3-black">Sign Up</button></span>
    //     </div>
    // </my-modal>