import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface TokenData {
  value: string;
  expiry: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStatusSubject = new BehaviorSubject<boolean>(
    this.isAuthenticated()
  );
  authStatus$ = this.authStatusSubject.asObservable();

  constructor() {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  getToken(): TokenData | null {
    if (this.isLocalStorageAvailable()) {
      const item = localStorage.getItem('authUser');
      if (item) {
        return JSON.parse(item) as TokenData;
      }
    }
    return null;
  }

  setToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      const now = new Date();
      const item = {
        value: token,
        expiry: now.getTime() + 8 * 60 * 60 * 1000, // 1 minuto em milissegundos
      };
      localStorage.setItem('authUser', JSON.stringify(item));
      this.authStatusSubject.next(true);
    }
  }

  removeToken(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('authUser');
      this.authStatusSubject.next(false);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token.value);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decodedToken = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      return decodedToken.exp < now;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  }
}
