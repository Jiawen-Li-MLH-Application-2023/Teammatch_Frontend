import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Course } from './Courses/Course';
import { MessageService } from "./message.service";
import { catchError, throwError, Observable, of} from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class CourseService {
  addCourseSuccess: boolean = false;
  courseurl = "http://127.0.0.1:10000/course/";
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
    private messageService: MessageService
  ) {}

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error.error); // log to console instead
      let currmessage = "";
      if (error.status == 200){
            currmessage = "Your operation success";
            this.messageService.update(currmessage, "SUCCESS");
      }
      else {
          if (operation == "addCourse"){
              currmessage = error.error;
          } else if (operation == "checkCourse") {
            if (error.error == "NOT FOUND") {
              currmessage = "Cannot find the course you input!";
            }
            else {
              currmessage = error.error;
            }
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

  getCourseInfo(course_name = ""): Observable<any> {
    let courseUrl: string = this.courseurl;
    if (course_name != ""){
      courseUrl += `?course_name=${course_name}`;
    }
    return this.http.get<Course>(courseUrl).pipe(
      catchError(this.handleError<any>("checkCourse"))
    );
  }
  addCourse(course_name: string, department: string, introduction: string): Observable<any>  {
    let courseUrl: string =  this.courseurl+'add';
    let request: any = {
      course_name: course_name,
      department: department,
      introduction: introduction
    };
    const httpOptions = {headers: this.header};
    return this.http.post(courseUrl, request,  httpOptions).pipe(
      catchError(this.handleError<any>("addCourse"))
    );
  }

}





