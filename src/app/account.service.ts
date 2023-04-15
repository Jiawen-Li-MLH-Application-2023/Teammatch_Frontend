import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import { Account } from "./account/account";
import { MessageService } from "./message.service";
import {Profile} from "./account/profile";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  accountServiceUrl: string = "http://127.0.0.1:10000/students/";
  addAccountSuccess: boolean = false;
  currentUser: Account;
  user_email: string;
  user_img: string;
  verified: boolean = true;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    public router: Router
  ) {
    if (localStorage.getItem('currentUser') !== 'undefined') {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser') || JSON.stringify(new Account()));
      this.user_img = localStorage.getItem('user_img') || "";
    }
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.messageService.clear();
      if(error.status == 200) {
        let curMessage;
        if(operation == "signUp") {
          curMessage = "Thanks for the registration! You will receive an email to verify your account!";
          this.addAccountSuccess = true;
        }
        if(curMessage) {
          this.messageService.update(curMessage, "SUCCESS");
        }
      } else {
        if (operation == 'signUp') {
          this.addAccountSuccess = false
          this.messageService.update(`${error.error}`, "DANGER");
        } else if (operation == 'updateProfile') {
          this.messageService.update(`${error.error}`, "DANGER");
        } else { // getProfile
          // do nothing
        }
      }
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }


  LoginWithGoogle(credentials: string) {
    const header = new HttpHeaders().set('Content-type', 'application/json');
    let request: any = {
      credentials: credentials
    };
    return this.http.post(this.accountServiceUrl + "loginwithgoogle", request,{ headers: header })
        .subscribe({
          next: (res:any) => {
            localStorage.setItem('user_img', res.picture);
            localStorage.setItem('access_token', res.token);
            if (res.uni == "N/A") {
              // New user, need to update account info (uni, password)
              this.getAccount("",res.email).subscribe((res:Account) => {
                localStorage.setItem('currentUser', JSON.stringify(res))
                this.router.navigate(['/account']).then(() => {
                  window.location.reload();
                });
              });
            } else {
              this.getAccount(res.uni).subscribe((res:Account) => {
                localStorage.setItem('currentUser', JSON.stringify(res))
                this.router.navigate(['/home']).then(() => {
                  window.location.reload();
                });
              });
            }
            this.messageService.update("Successfully log in!", "SUCCESS");
          },
          error: err => {
            this.messageService.update(`${err.error}`, "DANGER");
          }
        });
  }

  /**
   * Update user personal account info
   * @param uni
   * @param password
   */
  updateAccount(uni: string, password: string) {
    let accountUrl: string = this.accountServiceUrl + "account";
    let request: any = {
      uni: uni,
      password: password
    };
    return this.http.post<any>(accountUrl, request, { responseType: 'text' as 'json' });
  }

  /**
   * Log in user
   * @param uni
   * @param password
   */
  logIn(uni: string, password: string) {
    let request: any = {
      uni: uni,
      password: password
    };
    let res1 = this.http.get<any>("http://127.0.0.1:1000/course/");

    return this.http
        .post<any>(`${this.accountServiceUrl}login`, request)
        .subscribe({
          next: res => {
            localStorage.setItem('access_token', res.token);
            this.getAccount(res.uni).subscribe((res:Account) => {
              localStorage.setItem('currentUser', JSON.stringify(res))
              window.location.reload();
            });
            this.router.navigate(['/home']);
            this.messageService.update("Successfully log in!", "SUCCESS");
            this.verified = true;
          },
          error: err => {
            let error_message = err.error;
            this.messageService.update(`${error_message}`, "DANGER");
            if(error_message.includes("VERIFIED")) {
              this.verified = false;
              console.log("This account verified:", this.verified);
            }
          }
        });
  }


  /**
   * Resend Verification Email
   * @param uni
   * @param password
   */
  resendVerification(uni: string, password: string) {
    let request: any = {
      uni: uni,
      password: password
    };
    let accountUrl: string = this.accountServiceUrl + "resend";
    console.log(accountUrl, request);
    this.http.post<any>(accountUrl, request).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        if( err.status == 200 ) {
          let curMessage = "You have successfully re-sent a message! " +
            "Please use the link you get to activate your account and try to log in again!"
          this.messageService.update(curMessage, "SUCCESS");
          this.verified = true;
        } else {
          this.messageService.update(err.error, "DANGER");
        }
      }
    );
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Check if user logged in
   */
  get isLoggedIn(): boolean {
    let authToken = this.getToken();
    console.log("current token is " + authToken);
    return authToken !== null && this.currentUser.uni !== "N/A";
  }

  logOut() {
    localStorage.clear();
  }

  /** Get Account from the server
   * */
  getAccount(uni="", email=""): Observable<Account> {
    let accountUrl: string = this.accountServiceUrl + "account";
    if(uni != "" && email != ""){
      accountUrl += `?uni=${uni}&email=${email}`;
    } else if(uni != "") {
      accountUrl += `?uni=${uni}`;
    } else if(email != "") {
      accountUrl += `?email=${email}`;
    }
    return this.http.get<Account>(accountUrl).pipe(
      catchError(this.handleError<Account>("getAccount")),
    );
  }

  /** Add Account for the server
   * */
  signUp(
    uni: string, email: string, pwd: string, last_name: string, first_name: string, middle_name=""
  ): Observable<any> {
    let registerUrl: string = this.accountServiceUrl + "signup";
    let request: any = {
      uni: uni,
      email: email,
      password: pwd,
      last_name: last_name,
      first_name: first_name,
      middle_name: middle_name
    };
    console.log(registerUrl);
    return this.http.post<any>(registerUrl, request).pipe(
      catchError(this.handleError<any>("signUp")),
    );
  }

  /**
   * Update student's profile
   */
  updateProfile(uni: string, timezone: string, major: string, gender: string, msg: string=""): Observable<any>  {
    let profileUrl: string = this.accountServiceUrl + "profile";
    let request: any = {
      timezone: timezone,
      major: major,
      gender: gender,
      message: msg
    };
    return this.http.post<any>(profileUrl, request).pipe(
        catchError(this.handleError<any>("updateProfile"))
    );
  }

  /**
   * Get Profile for current user from the server
   */
  getProfile(): Observable<Profile> {
    let profileUrl: string = this.accountServiceUrl + `profile`;
    return this.http.get<Profile>(profileUrl).pipe(
        catchError(this.handleError<any>("getProfile"))
    );
  }
}
