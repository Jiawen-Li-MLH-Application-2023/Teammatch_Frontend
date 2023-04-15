import { Component, OnInit } from '@angular/core';
import { MessageService } from "../message.service";
import { CourseService } from "../course.service";
import { Course } from './Course';

@Component({
  selector: 'app-Courses',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {

  messageDict = {
    "ADD_COURSES": "You could add courses to database or check an existing course using name!",
    "MISSING_INPUT": "You have missing fields!",
  };
  Course_id : number = 0;
  Course_Name_add: string = "";
  Course_Name_check: string = ""
  Department: string = "";
  CourseIntroduction: string = "";
  CourseInfo: any;

  constructor(
    public messageService: MessageService,
    public courseService: CourseService,
  ) {
  }

  ngOnInit(): void {
    let message = this.getMessage("ADD_COURSES");
    this.messageService.update(message, "INFO");
  }
  getMessage(type: string): string {
    return Object.entries(this.messageDict)
      .filter(item => item[0] == type)
      .map(item => item[1])[0];
  }
  clearFields(): void {
    this.Course_Name_add = "";
    this.CourseIntroduction = "";
    this.Course_Name_check = "";
    this.Department = "";
    this.Course_id = 0;
  }

  setCourseInfo(theCourse: Course): void {
    console.log("Students = \n" + JSON.stringify(theCourse, null, 2));
    this.CourseInfo = theCourse;
  }

  AddCourse(): void {
    let curMessage = "";
    if(this.Course_Name_add === "" || this.CourseIntroduction === "" || this.Department === "" ) {
      curMessage = this.getMessage("MISSING_INPUT");
    }
    if(curMessage !== "") {
      // there are some error when inputting fields
      console.log(curMessage);
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.courseService.addCourse(
      this.Course_Name_add, this.Department, this.CourseIntroduction
    ).subscribe((_) => {});
  }

  CheckCourse(): void{
    let curMessage = "";
    if(this.Course_Name_check === "") {
      curMessage = this.getMessage("MISSING_INPUT");
    }
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.courseService.getCourseInfo(this.Course_Name_check).
    subscribe((data) => {
      this.setCourseInfo(data);
    });
  }
}
