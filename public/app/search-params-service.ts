import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class SearchParamsService {
    private params: string[] = new Array();
    paramChange: Subject<string[]> = new Subject<string[]>();

    storeParams(params: string) {
        this.clearParams();
        var nextWord = "";
        for(var i = 0; i < params.length; i++) {
            if(params.charAt(i) == ' ') {
                this.params.push(nextWord);
                nextWord = "";
            }
            else
                nextWord = nextWord + params.charAt(i);
        }
        this.params.push(nextWord);
        this.paramChange.next(this.params);
    }
    retrieveParams(): string[] {
        var params = this.params;
        return params;
    }
    clearParams() {
        this.params.length = 0;
    }

}