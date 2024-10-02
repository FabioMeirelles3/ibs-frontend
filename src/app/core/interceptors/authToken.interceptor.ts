import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tokenData = authService.getToken();

  if (tokenData && !authService.isTokenExpired(tokenData.value)) {
    const requestUrl: Array<string> = request.url.split('/');
    const apiUrl: Array<string> = environment.baseApiUrl.split('/');

    if (requestUrl[2] === apiUrl[2]) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${tokenData.value}`,
          token: `${tokenData.value}`,
        },
      });
    }
  }

  return next(request).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.removeToken();

        const company = router.url.split('/')[1];
        router.navigate([`/login`]);

        return throwError(
          () => new Error('Token expirado. Redirecionando para o login.')
        );
      }
      return throwError(
        () => new Error(error.error.message || 'Erro desconhecido.')
      );
    })
  );
};
