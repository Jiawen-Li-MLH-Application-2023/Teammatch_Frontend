import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Team } from './team/team';
import { MessageService } from "./message.service";
import { catchError, throwError, Observable, of} from 'rxjs';
import {AccountService} from "./account.service";

@Injectable({
    providedIn: 'root'
  })

export class TeamService {
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

  header = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'key': 'x-api-key',
    'value': 'NNctr6Tjrw9794gFXf3fi6zWBZ78j6Gv3UCb3y0x',
  });
    constructor(
      private http: HttpClient,
      private messageService: MessageService,
      private accountService: AccountService
    ) {}

  ngOnInit(): void{
    this.isLoggedIn = this.accountService.isLoggedIn;
    this.notLoggedIn = !this.isLoggedIn;
    if(this.isLoggedIn) {
      let account = this.accountService.currentUser;
      console.log(account);
      this.user.uni = account.uni;
      this.user.email = account.email;
      this.user.first_name = account.first_name;
      this.user.last_name = account.last_name;

      // get profile
      this.accountService.getProfile().subscribe(
        (profile) => {
          console.log(profile)
          if(profile) {
            this.user.timezone = profile.timezone;
            this.user.gender = profile.gender;
            this.user.major = profile.major;
            this.user.msg = profile.personal_message;
            if(this.user.gender == "f") {
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


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error.error); // log to console instead
      let currmessage = "";
      console.log(operation);
      if (error.status == 200){
            currmessage = "Your operation success";
            this.messageService.update(currmessage, "SUCCESS");
      }else {
        if (operation == "SearchTeam"){
          if (error.error == "There already exist one course") {
            console.log(111);
            currmessage = "There already exist one course";
          }
        }
        if (operation == "addteam"){
          currmessage = error.error;
        }
        if (operation == "deleteteam"){
          if (error.error == "No existed Preference is found!") {
            console.log(111);
            currmessage = "No existed Preference is found!";
          }
        }
        if (operation == "add_member"){
          currmessage = error.error;
        }
        if (operation == "matchteammate"){
          currmessage = error.error;
        }
      this.messageService.update(currmessage, "WARNING");
    }
    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
  }
  private setHeaders(): Headers {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*'
    };

    return new Headers(headersConfig);
  }


  getTeamServiceUrl(): string {
      const theUrl = window.location.href;
      let result: string;

      // This is some seriously bad code.
      // If you do this on a job interview, you did not learn this in my class.
      result = "http://127.0.0.1:10000/team/";
      return result;
    }

  retrieve_all_team_by_params(params: any): Observable<any> {
    let teamUrl: string = "";
    let headers =  new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      'key': 'x-api-key',
      'value': 'NNctr6Tjrw9794gFXf3fi6zWBZ78j6Gv3UCb3y0x'})
    if (params[`course_id`]) {
      teamUrl = this.getTeamServiceUrl() + `?course_id=${params[`course_id`]}&limit=${params[`size`]}&offset=${params[`size`]*params[`page`]}`;
    }
    const httpOptions = {headers: headers};
    console.log(teamUrl);
    return this.http.get(teamUrl).pipe(catchError(this.handleError<any>("SearchTeam")));
    }


  add_team(
    course_id: number, team_name: string, team_message: string,  number_needed: number, team_captain: string, team_captain_uni: string
  ): Observable<any> {
    let teamUrl: string = "";
    teamUrl = this.getTeamServiceUrl()  + `add/`;
    let request: any = {
      team_name: team_name,
      team_message: team_message,
      number_needed: number_needed,
      team_captain: team_captain,
      team_captain_uni: team_captain_uni,
      course_id:course_id
    };
    return this.http.post<any>(teamUrl, request).pipe(
      catchError(this.handleError<any>("addteam")));
  }

  delete_team(
    team_id: number, course_id: number, team_captain_uni: string
  ): Observable<any> {
    let teamUrl: string = "";
    let request: any = {
      team_id: team_id,
      course_id:course_id.toString(),
      team_captain_uni: team_captain_uni
    };
    teamUrl = this.getTeamServiceUrl() + `delete/`;
    return this.http.post<any>(teamUrl, request).pipe(
      catchError(this.handleError<any>("deleteteam")));
  }

  edit_team(
    team_name: string, course_id: number, team_captain: string, team_id: number,  number_needed: number, team_message: string,team_captain_uni: string
  ): Observable<any> {
    let teamUrl: string = "";
    teamUrl = this.getTeamServiceUrl() + `edit/`;
    let request: any = {
      team_name: team_name,
      team_message: team_message,
      number_needed: number_needed,
      team_captain: team_captain,
      team_captain_uni: team_captain_uni,
      course_id:course_id.toString()
    };
    return this.http.post<any>(teamUrl, request).pipe(
      catchError(this.handleError<any>("editteam")));
  }

  browse_team_info_by_input(course_id: number, team_captain_uni: string): Observable<any> {
    let teamUrl: string = "";
    teamUrl = this.getTeamServiceUrl() + `info/?team_captain_uni=${team_captain_uni}&course_id=${course_id}`;
    return this.http.get<any>(teamUrl).pipe(
      catchError(this.handleError<any>("addteam")));
  }


  browse_all_team_member(course_id: number, team_id: number): Observable<any> {
    let teamUrl: string = "";
    teamUrl = this.getTeamServiceUrl() + `team_member/?team_id=${team_id}&course_id=${course_id}`;
    return this.http.get<any>(teamUrl).pipe(
      catchError(this.handleError<any>("notFound")));
  }

  add_member(uni: string, Student_Name: string, team_id: number, course_id: number): Observable<any> {
    let teamUrl: string = "";
    let request: any = {
      uni: uni,
      student_name: Student_Name,
      team_id: team_id,
      course_id: course_id.toString()
    };
    teamUrl = this.getTeamServiceUrl() + `add_member/`;
    return this.http.post<any>(teamUrl, request).pipe(
      catchError(this.handleError<any>("add_member")));
  }

  delete_member(uni: string, team_id: number, course_id: number): Observable<any> {
    let teamUrl: string = "";
    let request: any = {
      uni: uni,
      team_id: team_id,
      course_id: course_id.toString()
    };
    teamUrl = this.getTeamServiceUrl() + `delete_member/`;
    return this.http.post<any>(teamUrl, request).pipe(
      catchError(this.handleError<any>("notFound")));
  }


  find_my_teammate(uni: string, course_id: number): Observable<any> {
  let teamUrl: string = "";
  teamUrl = this.getTeamServiceUrl() + `find_my_teammate/?uni=${uni}&course_id=${course_id}`;
  return this.http.get<any>(teamUrl).pipe(
    catchError(this.handleError<any>("matchteammate")));
  }
}
