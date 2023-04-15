import { Component, OnInit, TestabilityRegistry } from '@angular/core';
import { NgForm } from '@angular/forms';
import { catchError, Observable, of} from 'rxjs';
import { MessageService } from "../message.service";
import { TeamService } from "../team.service";
import { StudentinTeamService} from "../studentinteam.service"
import { Team } from './team';
import { StudentInTeam} from './studentinteam/studentinteam'
import {CoursePreference} from '../coursepreference/coursepreference'
import { AccountService } from "../account.service";

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  constructor(
    public messageService: MessageService,
    public TeamService:  TeamService,
    public accountService: AccountService
    ) {
  }

  messageDict = {
    "Select_Course": "Check Course first. Use Course ID to search for team.",
    "Search_Course": "This course does not exist",
    "MISSING_INPUT": "You should have all blanks filled!",
    "SUCCESS": "The search is successful",
    "FAILED": "FAILED IN SEARCH"
  };

  check_Course_id : number = 0;
  add_Course_id : number = 0;
  delete_Course_id = 0;
  delete_team_id = 0;
  edited_team_name: string = "";
  edited_team_captain: string = "";
  edited_team_id: number = 0;
  edited_Course_id: number = 0;
  edited_number_needed: number = 0;
  edited_team_messages: string = "join us! ";
  Team_id: number = 0;
  add_Team_Name: string = "";
  add_Team_message: string = "join us! ";
  add_Number_needed: number = 0;
  add_Team_Captain_Name: string = "";
  add_Team_Captain_Uni: string = "";
  add_click: boolean = false;
  search_click: boolean = true;
  edit_click: boolean = false;
  delete_captain_uni: string = "";
  edit_captain_uni: string = "";
  team_click: boolean = false;
  member_click: boolean = false;
  browse_team_id: number;
  browse_course_id: number;
  add_Student_Uni: string;
  add_Student_Name: string;
  delete_Student_Uni: string;


  Team_info: Team[];
  All_teams: Team[];
  Team_member: StudentInTeam[];
  currentWholeUrl : string;
  Find_My_Teammate: any;
  current_uni = this.accountService.currentUser.uni

  /* pagination field */
  page = 1;
  count = 0;
  pageSize = 3;
  pageSizes = [3, 6, 9];

  ngOnInit(): void {
    let message = this.getMessage("Select_Course");
    this.messageService.update(message, "INFO");
    this.currentWholeUrl = document.URL;
    this.add_click = false;
    this.search_click = true;
    console.log(this.current_uni);
  }

  showContent() {
    this.add_click = true;
    this.search_click = false;
    this.edit_click = false;
    this.team_click=false;
    this.member_click=false;
  }

  getMessage(type: string): string {
    return Object.entries(this.messageDict)
      .filter(item => item[0] == type)
      .map(item => item[1])[0];
  }
  getRequestParams(course_id: number, page: number, pageSize: number): any {
    let params: any = {};
    params[`course_id`] = course_id;
    params[`page`] = page-1;
    params[`size`] = pageSize;
    return params;
  }
  showContentSearch() {
    this.search_click = true;
    this.add_click = false;
    this.edit_click = false;
    this.team_click=false;
  }

  showTeam(course_id: number, team_captain_uni: string, team_id: number) : void{
    this.search_click = false;
    this.add_click = false;
    this.edit_click = false;
    this.team_click = true;
    this.browseTeambyInput(course_id, team_captain_uni, team_id);
  }

  showAddMmber() {
    this.search_click = false;
    this.add_click = false;
    this.edit_click = false;
    this.team_click=true;
    this.member_click=true;
  }

  RetrieveAllTeam(course_id=0): void{
    this.check_Course_id=course_id
    let curMessage = "";
    if(!this.check_Course_id) {
      curMessage = this.getMessage("MISSING_INPUT");
    }
    const params = this.getRequestParams(this.check_Course_id, this.page, this.pageSize);
    console.log("paras is ", params);
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.TeamService.retrieve_all_team_by_params(params).subscribe(
      res=>{
        let totalItems = res[0];
        this.All_teams=res[1];
        this.count = totalItems;
        console.log(this.All_teams);
      }
    )
  }

  browseTeambyInput(course_id=this.browse_course_id, team_captain_uni=this.edit_captain_uni, team_id=this.browse_team_id):void{
    let curMessage = "";
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    console.log(11111);
    this.TeamService.browse_team_info_by_input(course_id,team_captain_uni).subscribe((res) => {
        /**this.Team_info=Array.from(Object.values(res));**/
        this.Team_info = res;
        console.log(this.Team_info);
    });
    this.browse_all_team_member(course_id, team_id);
  }

  addteam(): void{
    let curMessage = "";
    if( this.add_Course_id === 0  || this.add_Team_Name === "" || this.add_Team_Captain_Name === "" || this.add_Team_Captain_Uni === "") {
      curMessage = this.getMessage("MISSING_INPUT");
    }
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    if (!this.accountService.isLoggedIn){
      this.messageService.update("You must login", "WARNING");
      return;
    }
    if (this.add_Team_Captain_Uni !== this.accountService.currentUser.uni){
      this.messageService.update("You can only search, add and edit your own course preference", "WARNING");
      return;
    }
    this.TeamService.add_team(this.add_Course_id, this.add_Team_Name, this.add_Team_message, this.add_Number_needed,
      this.add_Team_Captain_Name, this.add_Team_Captain_Uni
    ).subscribe(()=>{
      this.RetrieveAllTeam(this.add_Course_id)
      this.search_click = true;
      this.add_click = false;
      this.edit_click = false;
      this.team_click=false;
    });
  }


  DeleteTeam(team_id= this.delete_team_id, course_id= this.delete_Course_id, team_captain_uni=this.delete_captain_uni, check_form=false): void {
    let curMessage = "";
    if(team_id === 0 || course_id === 0) {
      curMessage = this.getMessage("MISSING_INPUT");
    }
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.TeamService.delete_team(team_id, course_id, team_captain_uni).subscribe(() => {
      if(check_form) { // refresh list
        this.All_teams = [];
      }
    });
    this.RetrieveAllTeam(course_id);
    this.search_click = true;
    this.add_click = false;
    this.edit_click = false;
    this.team_click=false;
  }

  setEditForm(team_id: number, course_id: number, captain_uni: string, team_name: string, team_captain:string, number_needed: number, team_messages:string): void {
    this.search_click = false;
    this.edit_click = true;
    this.edited_team_id = team_id;
    this.edited_Course_id = course_id;
    this.edit_captain_uni = captain_uni;
    this.edited_team_name = team_name;
    this.edited_team_captain = team_captain;
    this.edited_number_needed = number_needed;
    this.edited_team_messages = team_messages;
  }

  EditPreference(): void {
    let curMessage = "";
    if(this.edited_team_name === "" || this.edited_Course_id === 0 || this.edited_team_captain === "" ||
      this.edited_team_id === 0) {
      curMessage = this.getMessage("MISSING_INPUT");
    }
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    console.log(this.edited_team_name, this.edited_Course_id, this.edited_team_captain,
      this.edited_team_id, this.edited_number_needed, this.edited_team_messages, this.edit_captain_uni);
    this.TeamService.edit_team(
      this.edited_team_name, this.edited_Course_id, this.edited_team_captain,
      this.edited_team_id, this.edited_number_needed, this.edited_team_messages, this.edit_captain_uni
    ).subscribe((data) => {
      this.setEditForm(0, 0, "", "", "", 0, "");
      this.All_teams = [];
      this.RetrieveAllTeam(this.edited_Course_id);
    });
  }

  handlePageChange(event: number, course_id: number): void {
    this.page = event;
    this.RetrieveAllTeam(course_id); //TODO: Uncomment this after implementing API
  }

  handlePageSizeChange(event: any, course_id: number): void {
    this.pageSize = event.target.value;
    this.page = 1;
    this.RetrieveAllTeam(course_id); //TODO: Uncomment this after implementing API
  }

  browse_all_team_member(course_id=this.browse_course_id, team_id=this.browse_team_id):void{
    let curMessage = "";
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.TeamService.browse_all_team_member(course_id,team_id).subscribe((res) => {
        this.Team_member=Array.from(Object.values(res));
        console.log(this.Team_member);
    });
  }

  add_member(uni=this.add_Student_Uni,student_name=this.add_Student_Name, course_id=this.browse_course_id, team_id=this.browse_team_id):void{
    let curMessage = "";
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.TeamService.add_member(uni, student_name, team_id, course_id).subscribe(() => {
      this.member_click=false;
      this.browse_all_team_member(course_id, team_id);
  });
  }

  delete_member(uni=this.delete_Student_Uni, course_id=this.browse_course_id, team_id=this.browse_team_id):void{
    let curMessage = "";
    if(curMessage !== "") {
      // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.TeamService.delete_member(uni, team_id, course_id).subscribe((res) => {
      this.member_click=false;
      this.browse_all_team_member(course_id, team_id);
  });
  }

  find_my_teammate(uni= this.delete_captain_uni, course_id=this.browse_course_id):void{
    let curMessage = "";
    if(curMessage !== "") {
    // there are some error when inputting fields
      this.messageService.update(curMessage, "WARNING");
      return;
    }
    this.TeamService.find_my_teammate(uni, course_id).subscribe((res) => {

      /** this.Find_My_Teammate=Array.from(Object.values(res)); **/
      this.Find_My_Teammate = res;
  });
  }
}
