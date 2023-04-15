import { Component, OnInit } from '@angular/core';
import {MessageService} from "../message.service";
import {AccountService} from "../account.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export class AccountProfileComponent implements OnInit {
  messageDict = {
    "MISSING_INPUT_PROFILE": "You should have timezone & major & gender filled!",
    "UPDATE_PROFILE": "Please update your personal profile here",
    "SUCCESS_UPDATE_PROFILE": "You have successfully updated your profile!",
  };

  // Fields in profile form
  uni: string = "";
  first_name: string = "";
  timezone: string = "";
  major: string = "";
  gender: string = "";
  msg: string = "";

  constructor(
      public messageService: MessageService,
      public accountService: AccountService,
      public router: Router,
  ) {}

  ngOnInit(): void {
    if(this.accountService.isLoggedIn) {
      let user = this.accountService.currentUser;
      console.log(user);
      this.uni = user.uni;
      this.first_name = user.first_name;
      this.loadProfile();
    } else {
      //redirect to Home Page
      this.router.navigate(['/home']).then();
    }
  }

  /** Use message type to get message from message dict - only one output */
  getMessage(type: string): string {
    return Object.entries(this.messageDict)
        .filter(item => item[0] == type)
        .map(item => item[1])[0];
  }

  /**
   * Load the student profile information
   */
  loadProfile(): void {
    this.accountService.getProfile().subscribe(
        (profile) => {
          if(profile) {
            this.timezone = profile.timezone;
            this.gender = profile.gender;
            this.major = profile.major;
            this.msg = profile.personal_message;
            console.log("Loaded", this.timezone, this.gender, this.major, this.msg);
          }
        }
    )
  }

  /**
   * Update student's profile
   */
  updateProfile(): void {
    let warning = "";
    console.log("current user:", this.uni, this.timezone, this.major, this.first_name);
    if (this.timezone === "" || this.major === "" || this.gender === "") {
      warning = this.getMessage("MISSING_INPUT_PROFILE");
      this.messageService.update(warning, "WARNING");
      return;
    }
    this.accountService.updateProfile(this.uni, this.timezone, this.major, this.gender, this.msg
    ).subscribe((_) => {
          this.messageService.update(this.getMessage("SUCCESS_UPDATE_PROFILE"), "SUCCESS");
        }
    );
  }
}
