import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthSession, AuthUser, LoginCredentials } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.userSubject.asObservable();
  private token: string | null = null;

  constructor() {
    if (!this.browser) return;
    try {
      const token = localStorage.getItem('access_token');
      const user: unknown = JSON.parse(localStorage.getItem('auth_user') ?? 'null');
      if (token && this.isValid(token) && this.isUser(user)) {
        this.token = token;
        this.userSubject.next(user);
      } else this.logout();
    } catch { this.logout(); }
  }

  login(credentials: LoginCredentials) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      map(response => {
        if (!response.success || !response.data || !this.isValid(response.data.token) || !this.isUser(response.data.user)) {
          throw new Error(response.error?.message ?? response.message ?? 'Respuesta de autenticación inválida');
        }
        return response.data;
      }),
      tap((session: AuthSession) => {
        if (this.browser) {
          try {
            localStorage.setItem('access_token', session.token);
            localStorage.setItem('auth_user', JSON.stringify(session.user));
          } catch { this.logout(); throw new Error('No se pudo guardar la sesión en este navegador'); }
        }
        this.token = session.token;
        this.userSubject.next(session.user);
      }),
      catchError((error: unknown) => {
        const message = error instanceof HttpErrorResponse
          ? (error.status === 0 ? 'No se pudo conectar con el servidor' : error.error?.error?.message ?? error.error?.message ?? 'No se pudo iniciar sesión')
          : error instanceof Error ? error.message : 'No se pudo iniciar sesión';
        return throwError(() => new Error(message));
      }),
    );
  }

  getToken(): string | null {
    if (this.token && !this.isValid(this.token)) this.logout();
    return this.token;
  }

  logout(): void {
    this.token = null;
    this.userSubject.next(null);
    if (this.browser) {
      try { localStorage.removeItem('access_token'); localStorage.removeItem('auth_user'); } catch { /* Storage may be disabled. */ }
    }
  }

  private isUser(value: unknown): value is AuthUser {
    return typeof value === 'object' && value !== null && 'email' in value && typeof value.email === 'string'
      && 'rol' in value && typeof value.rol === 'string';
  }

  private isValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch { return false; }
  }
}
