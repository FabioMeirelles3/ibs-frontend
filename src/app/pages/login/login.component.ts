import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { LoginServiceApi } from '../../core/services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, InputTextModule, ButtonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error!: string | null;
  hide = true;

  constructor(
    private loginService: LoginServiceApi,
    private authService: AuthService,
    private router: Router
  ) { }

  login() {
    this.loginService
      .login({ email: this.username, password: this.password })
      .subscribe({
        next: (result: any) => {
          if (result) {
            this.authService.setToken(result.access_token);
            this.router.navigate([`/customer`]);
          }
        },
        error: (err) => {
          this.error = 'Os dados informados são inválidos!.';
          console.error('Login error: ', err);
        },
      });
  }
}
