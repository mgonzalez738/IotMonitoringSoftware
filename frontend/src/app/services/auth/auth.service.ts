import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private urlApi = environment.backendApiUrl;
  private authStatusListener = new Subject<boolean>();
  private token: string = null;
  private authStatus: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  getToken(): string {
    return this.token;
  }

  getAuthStatus(): boolean {
    return this.authStatus;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  async login(username: string, password: string):Promise<boolean> {
    let data = { UserId: username, Password: password };
    try {
      let res = await this.http.post<{Success: boolean; Token: string }>(this.urlApi + "/auth/login", data).toPromise();
      this.token = res.Token;
      if(this.token) {
        this.authStatus = true;
        this.authStatusListener.next(true);
        this.saveAuthData(this.token);
        this.router.navigate(['/']);
      }
      return this.authStatus;
    }
    catch (error) {
      this.token = null;
      this.authStatusListener.next(false);
      this.authStatus = false;
      throw error;
    }
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if(authInformation) {
      this.token = authInformation.token;
      this.authStatus = true;
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.authStatus = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private saveAuthData(token: string,) {
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
  }
}
