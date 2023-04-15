import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StudentInTeam } from './team/studentinteam/studentinteam';
import { MessageService } from "./message.service";
import { catchError, throwError, Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

export class StudentinTeamService {
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
      }else {
        if (operation == "Browse"){
          if (error.error == "NOT FOUND") {
            console.log(111);
            currmessage = "NOT FOUND";
          }
        }
      this.messageService.update(currmessage, "WARNING");
    }
    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
  }

  getTeamServiceUrl(): string {
      const theUrl = window.location.href;
      let result: string;

      // This is some seriously bad code.
      // If you do this on a job interview, you did not learn this in my class.
      result = "http://127.0.0.1:5011/";
      return result;
    }
    
    browse_all_team_member(course_id: number, team_id: string): Observable<any> {
        let teamUrl: string = "";
        teamUrl = this.getTeamServiceUrl() + `team/team_id=${team_id}&course_id=${course_id}`;
        return this.http.get<any>(teamUrl).pipe(
          catchError(this.handleError<any>("Browse")));
      }
}

