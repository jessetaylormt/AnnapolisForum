import { Component, Output, EventEmitter } from '@angular/core';

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

  @Output()
  hidden:EventEmitter<string> = new EventEmitter();

  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true);
  }

  public hide(): void {
    //need to find a way to clear form data from parent component. Could do this by binding them into here from parent.
    this.hidden.emit('hidden');
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }
}
