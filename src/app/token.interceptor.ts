import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { AccountService } from './account.service';
import { Observable, throwError } from 'rxjs';
import { catchError} from 'rxjs/operators';
import {Router} from "@angular/router";

const TOKEN_HEADER_KEY = 'access-token';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        public auth: AccountService,
        public router: Router
    ) {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = this.auth.getToken();
        if (token != null) {
            request = request.clone({headers: request.headers.set(TOKEN_HEADER_KEY, token)});
        }
        console.log(request);
        return next.handle(request).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && !request.url.includes('/login') && error.status === 401) {
                console.log("User session expired!!!!!!!");
                localStorage.clear();
                this.router.navigate(['/account']);
            }
            return throwError(error);
        }));
    }
}
