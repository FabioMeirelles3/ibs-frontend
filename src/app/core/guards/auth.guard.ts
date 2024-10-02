import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    if (token) {
      const expiration = this.authService.isTokenExpired(token.value);
      if (expiration) {
        this.authService.removeToken();
        this.redirectToLogin();
        return false;
      }
    }

    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.redirectToLogin();
      return false;
    }
  }

  private redirectToLogin(): void {
    this.router.navigate([`/login`]);
  }
}
