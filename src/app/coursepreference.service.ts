import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from "./message.service";
import { CoursePreference } from "./coursepreference/coursepreference"
import { catchError, throwError, Observable, of} from 'rxjs';
import { Course } from "./Courses/Course";
import {AccountService} from "./account.service";
@Injectable({
  providedIn: 'root'
})

export class CoursePreferenceService {
  preferenceurl = "http://127.0.0.1:10000/course/student_preference/";
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
      console.log(error.error);
      let currmessage = "";
      if (error.status == 200){
        currmessage = "Your operation success";
        this.messageService.update(currmessage, "SUCCESS");
      }
      else {
        if (operation == "addCoursePreference"){
          {
            if(error.error === "The course has been created!") {
              currmessage = "You have already added a preference for this course! You should go edit it!";
            } else {
              currmessage = error.error;
            }
          }
        } else if (operation == "editCoursePreference") {
          currmessage = error.error;
        } else if (operation == "deleteCoursePreference"){
          currmessage = error.error;
        } else {
          currmessage = error.error;
        }
        this.messageService.update(currmessage, "WARNING");
      }
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }


  retreiveCoursePreferenceByParams(params: any): Observable<any> {
    let courseUrl: string = "";
    let headers =  new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      'key': 'x-api-key',
      'value': 'NNctr6Tjrw9794gFXf3fi6zWBZ78j6Gv3UCb3y0x'})

    if (params[`uni`] !== "" && params[`size`] !== "" && params[`page`] !== ""){
      let uni = params[`uni`];
      let limit = params[`size`];
      let offset = params[`size`] * params[`page`];
      courseUrl = this.preferenceurl + `?uni=${uni}&limit=${limit}&offset=${offset}`;
    }
    const httpOptions = {headers: headers};
    console.log(courseUrl);
    return this.http.get<any>(courseUrl).pipe(
      catchError(this.handleError<any>("getCoursePreferencebyuni"))
    );
  }

  addCoursePreference(
    uni: string, course_id: number, prefered_Dept: string, prefered_Timezone: string, prefered_message: string
  ): Observable<any> {
    let courseUrl: string = "";
    courseUrl = this.preferenceurl + `add`;
    let request: any = {
      uni: uni,
      course_id: course_id.toString(),
      Dept: prefered_Dept,
      timezone: prefered_Timezone,
      message: prefered_message
    };
   // const httpOptions = {headers: this.header};
    return this.http.post<any>(courseUrl, request).pipe(
      catchError(this.handleError<any>("addCoursePreference")));
  }

  editCoursePreference(
    uni: string, course_id: number, prefered_Dept: string, prefered_Timezone: string, prefered_message: string
  ): Observable<any> {
    let courseUrl: string = "";
    courseUrl = this.preferenceurl + `edit/`;
    let request: any = {
      uni: uni,
      course_id: course_id.toString(),
      Dept: prefered_Dept,
      timezone: prefered_Timezone,
      message: prefered_message
    };
    return this.http.post<any>(courseUrl, request).pipe(
      catchError(this.handleError<any>("editCoursePreference")));
  }

  deleteCoursePreference(
    uni: string, course_id: number
  ): Observable<any> {
    let courseUrl: string = "";
    courseUrl = this.preferenceurl + `delete/`;
    let request: any = {
      uni: uni,
      course_id: course_id.toString()
    };
    return this.http.post<any>(courseUrl, request).pipe(
      catchError(this.handleError<any>("deleteCoursePreference")));
  }
}
