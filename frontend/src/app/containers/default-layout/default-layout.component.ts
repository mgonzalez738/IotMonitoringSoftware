import {Component, OnDestroy, OnInit} from '@angular/core';
import { navItems } from '../../_nav';

import { AuthService } from '../../services/auth/auth.service';
import { UsersService } from '../../services/users/users.service';
import { ClientsService } from '../../services/clients/clients.service';
import { ProjectsService } from '../../services/projects/projects.service';

import { User } from '../../models/userModel';
import { Client } from '../../models/clientModel';
import { Project } from '../../models/projectModel';

import { Subscription } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  public sidebarMinimized = false;
  public navItems = navItems;

  // Autenticacion
  private authListenerSubs: Subscription;
  private userIsAuthenticated = false;

  // Modelos
  public user: User;
  public client: Client;
  public clients: Client[];
  public project: Project;
  public projects: Project[];

  // Vista
  public clientName = "Seleccionar cliente"; // Nombre boton Cliente
  public clientSelected = false;
  public projectName = "Seleccionar proyecto"; // Nombre boton Proyectos
  public projectSelected = false;


  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private clientsService: ClientsService,
    private projectsService: ProjectsService,
   ) {}

  async ngOnInit(): Promise<void> {

    // Verifica si esta autorizado
    this.userIsAuthenticated = this.authService.getIsAuthenticated();
    // Suscribe a cambios de autorizacion
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });

    // Obtiene los datos del usuario si esta autenticado
    if(this.userIsAuthenticated) {
      this.user =  await this.usersService.getMe();
    }

    // Obtiene el cliente correspondiente al usuario si es super
    if(this.user.ClientId) {
      this.clientSelected = true;
      if(this.user && this.user.Role === "super") {
        this.client =  await this.clientsService.getClientById(this.user.ClientId);
        this.clientName = this.client.Name;
      }
    } else {
      this.clientSelected = false;
    }

    // Obtiene los clientes si el usuario es super
    if(this.user && this.user.Role === 'super') {
      this.clients = await this.clientsService.getClients();
    }

    // Carga los proyectos si el cliente ya esta seleccionado
    if(this.clientSelected) {
      this.loadProjects();
    }
  };

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  };

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  onLogout() {
    this.authService.logout();
    this.clientSelected = false;
  }

  public async clientSelectedChanged(event, client: Client) {
    await this.usersService.updateUserAssigenedClient(this.user._id, client._id);
    this.client = client;
    this.clientName = this.client.Name;
    this.clientSelected = true;
    this.projectName = "Seleccionar proyecto";
    this.projectSelected = false;
    this.loadProjects();
  }

  public async loadProjects() {
    this.projects = await this.projectsService.getProjects();
  }

  public async projectSelectedChanged(event, project: Project) {
    this.project = project;
    this.projectName = this.project.Name;
    this.projectSelected = true;
  }

}
