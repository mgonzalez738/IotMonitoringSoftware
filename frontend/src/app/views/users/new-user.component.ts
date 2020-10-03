import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { NgForm, PatternValidator } from '@angular/forms';
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
  roleSelected: string = "guest";
  projects: Project[];
  user: User;

  usernameError = false;
  usernameErrorMessage = "";
  passwordError = false;
  passwordErrorMessage = "";
  passwordRepeatError = false;
  passwordRepeatErrorMessage = "";
  firstnameError = false;
  firstnameErrorMessage = "";
  lastnameError = false;
  lastnameErrorMessage = "";
  emailError = false;
  emailErrorMessage = "";

  isLoading = false;
  storeError = false;
  storeErrorMessage = "";

  constructor(
    private usersService: UsersService,
    private projectsService: ProjectsService,
    private router: Router
  ) { }

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
    const passwordPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}");
    const whitespacePattern = new RegExp("^(?=.*\\s)");
    const letterNumberPattern = new RegExp("^(?=.*[^A-Za-z0-9])");

    if(form.value.username === "") {
      this.usernameError = true;
      this.usernameErrorMessage = "Usuario requerido.";
      error = true;
    } else if (whitespacePattern.test(form.value.username)){
      this.usernameError = true;
      this.usernameErrorMessage = "Espacios en blanco no permitidos.";
      error = true;
    } else if (letterNumberPattern.test(form.value.username)){
      this.usernameError = true;
      this.usernameErrorMessage = "Solo letras y numeros permitidos.";
      error = true;
    } else {
      const user = await this.usersService.getUserByUsername(form.value.username);
      if(user) {
        this.usernameError = true;
        this.usernameErrorMessage = "Nombre de usuario existente.";
        error = true;
      } else {
        this.usernameError = false;
      }
    }

    if(form.value.password === ""){
      this.passwordError = true;
      this.passwordErrorMessage = "Contraseña requerida.";
      error = true;
    } else if (!passwordPattern.test(form.value.password)){
      this.passwordError = true;
      this.passwordErrorMessage = "Requiere 8 o más caracteres con al menos una mayúscula, una minúscula y un número.";
      error = true;
    } else {
      this.passwordError = false;
    }

    if(form.value.passwordRepeat === ""){
      this.passwordRepeatError = true;
      this.passwordRepeatErrorMessage = "Repetir contraseña requerido.";
      error = true;
    } else if (form.value.passwordRepeat !== form.value.password){
      this.passwordRepeatError = true;
      this.passwordRepeatErrorMessage = "Las contraseñas no.";
      error = true;
    } else {
      this.passwordRepeatError = false;
    }

    if(form.value.firstname === ""){
      this.firstnameError = true;
      this.firstnameErrorMessage = "Nombre requerido.";
      error = true;
    } else {
      this.firstnameError = false;
    }

    if(form.value.lastname === ""){
      this.lastnameError = true;
      this.lastnameErrorMessage = "Apellido requerido.";
      error = true;
    } else {
      this.lastnameError = false;
    }

    if(form.value.email === ""){
      this.emailError = true;
      this.emailErrorMessage = "Email requerido.";
      error = true;
    } else {
      this.emailError = false;
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
    if((form.value.role !== 'super') && (form.value.role !== 'administrator')) {
      if(form.value.projects.length > 0) {
        this.user.ProjectsId = form.value.projects;
      }
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
