import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  HttpClient,
  HttpContext,
  HttpContextToken,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
export interface Login {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginServiceApi {
  private baseApiUrl = environment.baseApiUrl;
  private readonly baseUrl = `${this.baseApiUrl}/sessions`;

  constructor(private http: HttpClient, private router: Router) {}

  public login(loginDto: Login): Observable<Login> {
    const BASE_URL = new HttpContextToken<string>(() => '');
    return this.http.post<Login>(this.baseUrl, loginDto, {
      context: new HttpContext().set(BASE_URL, this.baseUrl),
    });
  }

  deslogar() {
    localStorage.clear();
    this.router.navigate(['login']);
  }
}
