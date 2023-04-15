import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { AccountComponent } from "./account/account.component";
import { CourseComponent } from "./Courses/course.component"
import { CoursepreferenceComponent } from './coursepreference/coursepreference.component';
import { TeamComponent } from "./team/team.component";
import { StudentinteamComponent} from "./team/studentinteam/studentinteam.component"
import {AccountProfileComponent} from "./account-profile/account-profile.component";
import {HomeComponent} from "./home/home.component";
import { AccountGuard} from "./account.guard";
import {VerificationComponent} from "./verification/verification.component";

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component:  HomeComponent},
  { path: 'account', component: AccountComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'profile', component: AccountProfileComponent, canActivate: [AccountGuard]},
  { path: 'about', component:  AboutComponent},
];
const routes1: Routes = [
  { path: '', redirectTo: '/courses', pathMatch: 'full' },
  { path: 'courses', component:  CourseComponent},
  { path: 'about', component:  AboutComponent},
];
const routes2:  Routes = [
  { path: '', redirectTo: '/preferences', pathMatch: 'full' },
  { path: 'preferences', component:  CoursepreferenceComponent},
  { path: 'courses', component:  CourseComponent},
];
const routes3:  Routes = [
  { path: '', redirectTo: '/team', pathMatch: 'full' },
  { path: 'team', component:  TeamComponent,
  children: [
    {path: 'info', component: StudentinteamComponent}
  ]},
  { path: 'about', component:  AboutComponent},
];

const routes4:  Routes = [
  { path: '', redirectTo: '/team-info', pathMatch: 'full' },
  { path: 'team-info', component:  StudentinteamComponent, },
  { path: 'about', component:  AboutComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes), RouterModule.forRoot(routes1), RouterModule.forRoot(routes2),
    RouterModule.forRoot(routes3), RouterModule.forRoot(routes4)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
