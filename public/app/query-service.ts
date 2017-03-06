import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { SearchParamsService } from './search-params-service';
import { Thread } from './thread';
import { Post } from './post';

@Injectable()
export class QueryService {

    //baseURL = "http://69.255.35.9:8080/"
    baseURL = "http://localhost:4000/"
    private recentThreadsUrl = this.baseURL + 'api/recent-threads';
    private searchUrl = this.baseURL + 'api/search';
    private threadUrl = this.baseURL + 'api/thread';
    private postsUrl = this.baseURL + 'api/thread-posts';
    private loginUrl = this.baseURL + 'api/login';
    private logoutUrl = this.baseURL + 'api/logout';
    private signupUrl = this.baseURL + 'api/signup';
    private newThreadUrl = this.baseURL + 'api/new-thread';

    constructor(private http: Http) { }

    getThread(id: number): Promise<Thread> {
        var specificUrl = this.threadUrl + '/' + id;
        return this.http.get(specificUrl)
            .toPromise()
            .then(
                response => response.json().data[0] as Thread)
            .catch(this.handleError);
    }

    getThreadPosts(id: number): Promise<Post[]> {
        var specificUrl = this.postsUrl + '/' + id;
        return this.http.get(specificUrl)
            .toPromise()
            .then(response => response.json().data as Post[])
            .catch(error => this.handleError(error));
    }

    getAllThreads(): Promise<Thread[]> {
        return this.http.get(this.recentThreadsUrl)
            .toPromise()
            .then(response => response.json().data as Thread[])
            .catch(this.handleError);
    }

    getSearchedThreads(params: string[]): Promise<Thread[]> {
        var specificUrl = this.searchUrl + '?params=' + params;
        return this.http.get(specificUrl)
            .toPromise()
            .then(response => response.json().data as Thread[])
            .catch(this.handleError);
    }

    postLogin(username: string, password: string): Promise<string> {
        var credentials = {username, password};
        return this.http.post(this.loginUrl, credentials)
                 .toPromise()
                 .then(response => 
                    {
                        if(response.status == 200) {
                            return username;
                        }
                    })
                 .catch(this.handleError);
    }

    postLogout(username: string): Promise<string> {
        var credentials = {username};
        return this.http.post(this.logoutUrl, credentials)
                 .toPromise()
                 .then(response => 
                    {
                        if(response.status == 200) {
                            return username;
                        }
                    })
                 .catch(this.handleError);
    }

    postSignup(username: string, password: string, email: string): Promise<string> {
        var credentials = {username, password, email};
        return this.http.post(this.signupUrl, credentials)
                 .toPromise()
                 .then(response => 
                    {
                        if(response.status == 201) {
                            return username;
                        }
                    })
                 .catch(this.handleError);
    }

    postNewPost(newPost: Post, id: number): Promise<Post> {
        var specificUrl = this.threadUrl + '/' + id;
        return this.http.post(specificUrl, newPost)
                 .toPromise()
                 .then(response => 
                    {
                        if(response.status == 201) {
                            newPost.timestamp = "just now";
                            return newPost;
                        }
                    })
                 .catch(this.handleError);
    }

    //returns the index of the new Thread
    postNewThread(newThread: Thread): Promise<number> {
        return this.http.post(this.newThreadUrl, newThread)
                 .toPromise()
                 .then(response => 
                    {
                        if(response.status == 201) {
                            return response.json().newThreadId;
                        }
                    })
                 .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        //console.error('An error occurred', error); // for dev purposes
        if(error.status == 500) {
            alert("Server responded that the request could not be saved to the database. Please check credentials.");
        }
        else if(error.status == 0) {
            alert("The app has crashed -- possible server is down. Please retry or contact admin by email.")
        }
        else if(error.status == 404) {
            alert("The resource requested is unavailable. Please check exact URL or navigate from Home page.")
        }
        else if(error.status == 401) {}//do nothing, user will be notified of error in login
        else if(error.status == 400) {
            alert(error.json().error);
        }
        else alert("The app encountered an unexpected error, code: " + error.status + ". Please contact admin.");
        return Promise.reject(error.json().error || error);
    }
}