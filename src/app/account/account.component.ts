import {Component, NgZone, OnInit} from '@angular/core';
import { MessageService } from "../message.service";
import { AccountService } from "../account.service";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { environment } from 'src/environments/environment';
import {Account} from "./account";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  messageDict = {
    "TO_LOGIN": "Please input your account uni and password!",
    "TO_REGISTER": "Required fields are: uni & firstname & lastname & password & email address!",
    "MISSING_INPUT_SIGNUP": "You should have uni & firstname & lastname & password & email address filled!",
    "SUCCESS": "Thanks for the registration! You will receive an email to verify your account!",
    "FAILED": "FAILED IN REGISTRATION:",
    "MISSING_INPUT_LOGIN": "You should have uni & password filled!",
    "INVALID_EMAIL_ADDRESS": "Your email address should apply to valid format: xxx@xxx.xxx!",
    "TO_UPDATE_ACCOUNT": "We notice that it's your first time logging in using Google, please further update your " +
      "account to finish registration. " + "Required fields are: uni & password",
  };

  // Fields in students forms
  uni: string = "";
  first_name: string = "";
  middle_name: string = "";
  last_name: string = "";
  password: string = "";
  email_address: string = "";
  user_email = new FormGroup({
    primary_email: new FormControl('',[
      Validators.required,
      Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
    ])
  });

  private clientId = environment.clientId;

  constructor(
      private _ngZone: NgZone,
      public messageService: MessageService,
      public accountService: AccountService,
      public router: Router,
  ) {}


  ngOnInit(): void {
    let message = this.getMessage("TO_LOGIN");
    this.messageService.update(message, "INFO");
    if (!this.accountService.isLoggedIn && this.accountService.currentUser.uni != "N/A") {
      this.loadGoogleLogIn()
    } else {
      console.log(this.accountService.currentUser)
      if (this.accountService.currentUser.uni == "N/A") {
        let current_user = this.accountService.currentUser
        this.first_name = current_user.first_name
        this.email_address = current_user.email
        this.changeForm(false,false,true);
      }
    }
  }

  /**
   * Change form between login, sign-up, profile
   * @param toSignUp
   * @param toLogIn
   * @param toUpdateAccount
   * @param updateMessage
   */
  changeForm(toSignUp: boolean, toLogIn: boolean, toUpdateAccount: boolean, updateMessage: boolean=true): void {
    if (!toUpdateAccount) {
      this.clearField();
    }
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const updateAccountForm = document.getElementById("update-account-form");
    let message = "";
    if(registerForm != null && loginForm != null && updateAccountForm != null) {
      registerForm.style.display = "none";
      loginForm.style.display = "none";
      updateAccountForm.style.display = "none";
      if (toSignUp) {
        message = this.getMessage("TO_REGISTER")
        registerForm.style.display = "block";
      } else if (toLogIn) {
        message = this.getMessage("TO_LOGIN")
        loginForm.style.display = "block";
        this.loadGoogleLogIn();
        //window.location.reload();
      } else if (toUpdateAccount) {
        message = this.getMessage("TO_UPDATE_ACCOUNT")
        updateAccountForm.style.display = "block";
      }
    }
    if (updateMessage) {
      this.messageService.update(message, "INFO");
    }
  }

  loadGoogleLogIn() {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      google.accounts.id.renderButton(
          // @ts-ignore
          document.getElementById("buttonDiv"),
          { theme: "outline", size: "large", width: "100%", logo_alignment: "center" }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
  }

  async handleCredentialResponse(response: CredentialResponse) {
    await this.accountService.LoginWithGoogle(response.credential);
  }

  get primEmail() {
    return this.user_email.get("primary_email");
  }

  /** Use message type to get message from message dict - only one output */
  getMessage(type: string): string {
    return Object.entries(this.messageDict)
        .filter(item => item[0] == type)
        .map(item => item[1])[0];
  }

  clearField() : void {
    this.uni = "";
    this.first_name = "";
    this.middle_name = "";
    this.last_name = "";
    this.password = "";
    this.email_address = "";
  }

  /**
   * When new user use Google login, they need to update their account info
   * uni and password
   */
  updateAccount() {
    this.accountService.updateAccount(this.uni, this.password)
        .subscribe({
          next: _ => {
            this.accountService.getAccount(this.uni).subscribe((res: Account) => {
              localStorage.setItem('currentUser', JSON.stringify(res))
            });
            this.router.navigate(['/home']).then(() => {
              window.location.reload();
            });
          },
          error: err => {
            localStorage.clear();
            this.changeForm(false,true,false);
            this.messageService.update(`${JSON.stringify(err.error)}`, "DANGER");
          }
        });
  }

  /** createAccount:
   * 1. Check if all necessary inputs are filled -> if not, display warning message
   * 2. Connect to BE service and create a new Account: Show Result Message
   * */
  createAccount(): void {
    let curMessage = "";
    console.log("You click on create account!")
    if(this.uni === "" || this.first_name === "" || this.last_name === "" || this.password === "" || this.email_address === "") {
      curMessage = this.getMessage("MISSING_INPUT_SIGNUP");
    }
    let email_valid  = this.email_address.match("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
    if( ! email_valid || email_valid.length == 0) {
      curMessage = this.getMessage("INVALID_EMAIL_ADDRESS");
    }
    if(curMessage !== "") {
      // there are some error when inputting fields
      console.log(curMessage);
      this.messageService.update(curMessage, "WARNING");
      return;
    }

    this.accountService.signUp(
        this.uni, this.email_address, this.password, this.last_name, this.first_name, this.middle_name
    ).subscribe((_) => {
          if(this.accountService.addAccountSuccess) {
            this.changeForm(false, true, false, false);
          }
        }
    );
  }

  /** logIn:
   * 1. Check if all necessary inputs are filled -> if not, display warning message
   * 2. Connect to BE service and create a new Account: Show Result Message
   * 3. After successful login, change to profile form
   * */
  logIntoAccount(): void {
    let curMessage = "";
    console.log("You click on login account!")
    if(this.uni === "" || this.password === "") {
      curMessage = this.getMessage("MISSING_INPUT_LOGIN");
    }
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.accountService.logIn(this.uni, this.password);
  }

  stopUpdate(): void {
    this.accountService.logOut();
    this.changeForm(false, true, false);
  }
}
