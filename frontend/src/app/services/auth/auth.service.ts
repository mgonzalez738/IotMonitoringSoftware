import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment'
import { User } from '../../models/userModel';
import { LoginResponse } from '../../models/backendApiResponses';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private urlApi = environment.backendApiUrl;
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  login(username: string, password: string):Promise<boolean>{
    let data = { UserId: username, Password: password };
    return this.http.post<{Success: boolean; Token: string}>(this.urlApi + "/auth/login", data).toPromise().then((res)=>{
      this.token = res.Token;
      if(this.token) {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.router.navigate(['/']);
      }
      return res.Success;
    });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/login']);
  }
}
