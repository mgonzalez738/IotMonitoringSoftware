import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { navItems } from '../../_nav';
import { AuthService } from '../../services/auth/auth.service';
import { UsersService } from '../../services/users/users.service';
import { ClientsService } from '../../services/clients/clients.service';
import { ProjectsService } from '../../services/projects/projects.service';

import { UserPopulated } from '../../models/userModel';
import { Client } from '../../models/clientModel';
import { Project } from '../../models/projectModel';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {

  public sidebarMinimized = false;
  public navItems = navItems;

  private authStatusSubscription: Subscription;
  private authStatus: boolean = false;
  public authUser: UserPopulated;

  public clients: Client[];
  public projects: Project[];

  public clientIsLoading = false;
  public projectIsLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
    private clientsService: ClientsService,
    private projectsService: ProjectsService,
   ) {}

  async ngOnInit(): Promise<void> {

    // Estado autenticacion
    this.authStatus = this.authService.getAuthStatus();
    // Suscribe a cambios de autenticacion
    this.authStatusSubscription = this.authService
      .getAuthStatusListener()
      .subscribe(status=> {
        this.authStatus = status;
      });

    // Obtiene el usuario autenticado
    try {
      this.authUser = await this.usersService.getAuthUser();
    } catch (error) {
      console.log(error);
    }

    // Obtiene los clientes si el usuario es super
    if(this.authUser && this.authUser.Role === 'super') {
      await this.loadClients();
    }

    // Carga los proyectos si el cliente ya esta seleccionado
    if(this.authUser && this.authUser.Client) {
      await this.loadProjects();
     }
  };

  ngOnDestroy(): void {
    this.authStatusSubscription.unsubscribe();
  };

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  onLogout() {
    this.authService.logout();
  }

  public async onClientSelectedChanged(client: Client) {
    this.clientIsLoading = true;
    this.authUser.Project = null; // Evita que se vea que vuelve al dashboard al cambiar cliente -> revisar
    try {
      // Actualiza el cliente y el usuario autorizado
      await this.usersService.updateUserSelectedClient(this.authUser._id, client._id);
      await this.usersService.updateUserSelectedProject(this.authUser._id, null);
      this.authUser = await this.usersService.getAuthUser();
      this.clientIsLoading = false;
      await this.loadProjects();
    } catch (error) {
      this.clientIsLoading = false;
      console.log(error);
    }
  }

  public async onProjectSelectedChanged(project: Project) {
    this.projectIsLoading = true;
    try {
      // Actualiza el proyecto y el usuario autorizado
      await this.usersService.updateUserSelectedProject(this.authUser._id, project._id);
      this.authUser = await this.usersService.getAuthUser();
      this.projectIsLoading = false;
    } catch (error) {
      this.projectIsLoading = false;
      console.log(error);
    }
  }

  private async loadClients() {
    try {
      this.clients = await this.clientsService.getClients();
    } catch (error) {
      console.log(error);
    }
  }

  private async loadProjects() {
    try {
      this.projects = await this.projectsService.getProjects();
    } catch (error) {
      console.log(error);
    }
  }
}
