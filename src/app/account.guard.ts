import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivate,
    Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
    providedIn: 'root',
})
export class AccountGuard implements CanActivate {
    constructor(public accountService: AccountService, public router: Router) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.accountService.isLoggedIn) {
            window.alert('Access not allowed!');
            this.router.navigate(['account']);
        }
        return true;
    }
}
