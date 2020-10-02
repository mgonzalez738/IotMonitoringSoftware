import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { UsersService } from '../../services/users/users.service';
import { ProjectsService } from '../../services/projects/projects.service';

import { User, UserPopulated } from '../../models/userModel';
import { Project } from '../../models/projectModel';

@Component({
  templateUrl: 'new-user.component.html'
})
export class NewUserComponent implements OnInit {

  authUser: UserPopulated;
  user: User;

  usernameEmpty = false;
  passwordEmpty = false;
  firstnameEmpty = false;
  lastnameEmpty = false;
  emailEmpty = false;
  emailInvalid = false;
  isLoading = false;
  storeError = false;
  storeErrorMessage = "";

  roleSelected: string = "guest";
  projects: Project[];

  constructor(
    private usersService: UsersService,
    private projectsService: ProjectsService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.authUser = await this.usersService.getAuthUser();
      this.projects = await this.projectsService.getProjects();
    } catch (error) {
      console.log(error);
    }
  }

  async OnOk(form: NgForm) {
    let error = false;
    this.isLoading = true;
    if(form.value.username === ""){
      this.usernameEmpty = true;
      error = true;
    } else {
      this.usernameEmpty = false;
    }
    if(form.value.password === ""){
      this.passwordEmpty = true;
      error = true;
    } else {
      this.passwordEmpty = false;
    }
    if(form.value.firstname === ""){
      this.firstnameEmpty = true;
      error = true;
    } else {
      this.firstnameEmpty = false;
    }
    if(form.value.lastname === ""){
      this.lastnameEmpty = true;
      error = true;
    } else {
      this.lastnameEmpty = false;
    }
    if(form.value.email === ""){
      error = true;
      this.emailEmpty = true;
    } else {
      this.emailEmpty = false;
    }
    if(error) {
      this.isLoading = false;
      return;
    }
    this.user = new User();
    this.user.UserId = form.value.username;
    this.user.Password = form.value.password;
    this.user.FirstName = form.value.firstname;
    this.user.LastName = form.value.lastname;
    this.user.Email = form.value.email;
    this.user.Role = form.value.role;
    if(form.value.projects.length > 0) {
      this.user.ProjectsId = form.value.projects;
    }
    if(this.user.Role !== 'super') {
      this.user.ClientId = this.authUser.Client._id;
    }

    try {
      let res = await this.usersService.storeUser(this.user);
      this.storeError = false;
      this.storeErrorMessage = "";
      this.isLoading = false;
      this.router.navigate(['/users']);
    }
    catch (error) {
      this.storeError = true;
      this.storeErrorMessage = error.message;
      this.isLoading = false;
    }

    return;
  }

}
