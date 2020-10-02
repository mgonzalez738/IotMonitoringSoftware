import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment'
import { User, UserPopulated } from '../../models/userModel'

@Injectable({ providedIn: 'root' })
export class UsersService {

  private urlApi = environment.backendApiUrl;

  constructor(private http: HttpClient) { }

  // Obtiene los datos del usuario actual
  async getAuthUser(): Promise<UserPopulated> {
    let res = await this.http.get<{Data: UserPopulated}>(this.urlApi + "/users/me?populate=true").toPromise();
    return res.Data;
  }

  // Actualiza el cliente seleccionado del usuario actual
  async updateUserSelectedClient(userId: string, clientId: string): Promise<void> {
    let res = await this.http.put(this.urlApi + "/users/" + userId, { ClientId: clientId }).toPromise();
  }

   // Actualiza el proyecto seleccionado del usuario actual
   async updateUserSelectedProject(userId: string, projectId: string): Promise<void> {
    let res = await this.http.put(this.urlApi + "/users/" + userId, { ProjectId: projectId }).toPromise();
  }

  // Obtiene el listado de usuarios
  async getUsers(): Promise<User[]> {
    let res = await this.http.get<{Data: User[]}>(this.urlApi + "/users").toPromise();
    return res.Data;
  }

  // Guarda un usuario
  async storeUser(user:User): Promise<string> {
    let res = await this.http.post<{'Data._id': string }>(this.urlApi + "/users", user).toPromise();
    return res["Data._id"];
  }

  // Elimina un usuario
  async deleteUser(id:string): Promise<void> {
    await this.http.delete(this.urlApi + "/users/" + id).toPromise();
    return;
  }

}
