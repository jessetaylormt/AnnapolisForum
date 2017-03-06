import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-not-found',
  template: `
    <h3 class="mt-notify-missing w3-center w3-text-red">404! Can't find the page you requested. Try loading the home page</h3>
  `
})
export class NotFoundComponent {

}
