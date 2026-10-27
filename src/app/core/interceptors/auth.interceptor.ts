import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const api = environment.apiUrl.replace(/\/+$/, '');
  const isApi = request.url === api || request.url.startsWith(`${api}/`);
  const isLogin = request.url === `${api}/auth/login`;
  if (!isApi || isLogin) return next(request);
  const token = auth.getToken();
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        auth.logout();
        void router.navigate(['/auth']);
      }
      return throwError(() => error);
    }),
  );
};
