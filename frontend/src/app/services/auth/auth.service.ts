import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class AuthService {

  private urlApi = environment.backendApiUrl;
  private username: string;
  private userid: string;
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

  async login(username: string, password: string):Promise<boolean>{
    let data = { UserId: username, Password: password };
    return this.http.post<{Success: boolean; Token: string}>(this.urlApi + "/auth/login", data).toPromise().then((res)=>{
      this.token = res.Token;
      if(this.token) {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.saveAuthData(this.token, this.username);
        this.router.navigate(['/']);
      }
      return res.Success;
    });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if(authInformation) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private saveAuthData(token: string, username: string) {
    localStorage.setItem('token', token);
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    if(!token) {
      return;
    }
    return {
      token: token
    }
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
}
