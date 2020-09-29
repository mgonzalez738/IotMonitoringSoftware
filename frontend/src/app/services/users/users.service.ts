import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment'
import { User } from '../../models/userModel'

@Injectable({ providedIn: 'root' })
export class UsersService {

  private urlApi = environment.backendApiUrl;

  constructor(private http: HttpClient) { }

  // Obtiene los datos del usuario actual
  async getMe(): Promise<User> {
    let res = await this.http.get<{Data: User}>(this.urlApi + "/users/me").toPromise();
    return res.Data;
  }

  // Actualiza el cliente seleccionado del usuario actual
  async updateUserAssigenedClient(userId: string, clientId: string): Promise<void> {
    let res = await this.http.put(this.urlApi + "/users/" + userId, { ClientId: clientId }).toPromise();
  }

}
