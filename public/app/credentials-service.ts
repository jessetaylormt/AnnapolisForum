import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class CredentialsService {
    private username: string = "";
    credentialsChange: Subject<string> = new Subject<string>();

    storeParams(username: string) {
        sessionStorage.setItem("username", username);
        this.credentialsChange.next(username);
    }
    retrieveParams(): string {
        return sessionStorage.getItem("username");
    }
    removeParams(): void {
        sessionStorage.removeItem("username");
        this.credentialsChange.next("");
    }

}