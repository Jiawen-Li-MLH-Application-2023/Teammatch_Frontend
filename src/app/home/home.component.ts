import { Component, OnInit } from '@angular/core';
import {AccountService} from "../account.service";
import {Router} from "@angular/router";
import {Account} from "../account/account";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  notLoggedIn = true;
  user = {
    "uni": "",
    "email": "",
    "first_name": "",
    "last_name": "",
    "timezone": "N/A",
    "major":"N/A",
    "gender":"N/A",
    "msg":"N/A",
    "department": "N/A",
  }

  FEMALE_IMAGE = "../../assets/female.png";
  MALE_IMAGE = "../../assets/male.png";
  UNKNOWN_IMAGE = "../../assets/unknown.png";
  profile_img = this.UNKNOWN_IMAGE;

  constructor(
    private http: HttpClient,
    public accountService: AccountService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.accountService.isLoggedIn;
    this.notLoggedIn = !this.isLoggedIn;
    if(this.isLoggedIn) {
      let account = this.accountService.currentUser;
      console.log(account);
      this.user.uni = account.uni;
      this.user.email = account.email;
      this.user.first_name = account.first_name;
      this.user.last_name = account.last_name;
      if (this.accountService.user_img !== "") {
        this.profile_img = this.accountService.user_img;
      }

      // get profile
      this.accountService.getProfile().subscribe(
        (profile) => {
          console.log(profile)
          if(profile) {
            this.user.timezone = profile.timezone;
            this.user.gender = profile.gender;
            this.user.major = profile.major;
            this.user.msg = profile.personal_message;
            if (this.accountService.user_img !== "") {
              this.profile_img = this.accountService.user_img;
            } else if(this.user.gender == "f") {
              this.profile_img = this.FEMALE_IMAGE;
            } else if (this.user.gender == "m") {
              this.profile_img = this.MALE_IMAGE;
            } else {
              this.profile_img = this.UNKNOWN_IMAGE;
            }
          }
        }
      )
    } else {
      this.isLoggedIn = false;
      this.notLoggedIn = true;
    }
  }

  logOut(): void {
    this.accountService.logOut();
     window.location.reload();
  }

  toAccount(): void {
    this.router.navigate(['/account']).then(() => {
      window.location.reload();
    });
  }

}
