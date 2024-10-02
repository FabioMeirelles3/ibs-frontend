import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LoginServiceApi } from '../../core/services/login.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  title = 'BocaCheia';

  constructor(private loginService: LoginServiceApi) {}

  logout(): void {
    this.loginService.deslogar();
  }
}
