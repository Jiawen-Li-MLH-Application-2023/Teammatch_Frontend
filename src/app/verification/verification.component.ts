import { Component, OnInit } from '@angular/core';
import {MessageService} from "../message.service";
import {AccountService} from "../account.service";

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {
  uni: string = "";
  password: string = "";

  constructor(
    public messageService: MessageService,
    public accountService: AccountService,
  ) { }

  ngOnInit(): void {
    this.messageService.update("Please type your UNI and Password!", "INFO");
  }

  resend(): void {
    if( this.uni ==="" || this.password === "" ) {
      this.messageService.update("UNI and Password are required!", "WARNING");
    }
    this.accountService.resendVerification(this.uni, this.password);
  }

}
