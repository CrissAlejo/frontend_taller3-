import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';
import { authInterceptor } from './interceptors/auth.interceptor';
import { authGuard } from './guards/auth.guard';
import { environment } from '../../environments/environment';

describe('Autenticación JWT', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let client: HttpClient;
  const user = { email: 'alumno@example.com', rol: 'alumno' };
  const jwt = (expires: number) => `e30.${btoa(JSON.stringify({ exp: expires }))}.signature`;
  const token = jwt(Math.floor(Date.now() / 1000) + 7200);
  beforeEach(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
    ] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
  });
  afterEach(() => { http.verify(); auth.logout(); });
  function login() {
    auth.login({ email: user.email, password: 'secret123' }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ success: true, data: { token, user } });
  }
  it('guarda la sesión y envía Bearer solo a la API configurada', () => {
    login();
    expect(localStorage.getItem('access_token')).toBe(token);
    client.get(`${environment.apiUrl}/empleados`).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/empleados`);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush({});
    client.get('https://example.com/api').subscribe();
    const external = http.expectOne('https://example.com/api');
    expect(external.request.headers.has('Authorization')).toBeFalse();
    external.flush({});
  });
  it('bloquea acceso directo sin sesión y lo permite con token vigente', () => {
    const guard = () => TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect((guard() as UrlTree).toString()).toBe('/auth');
    login();
    expect(guard()).toBeTrue();
    auth.logout();
    expect(auth.getToken()).toBeNull();
  });
  it('descarta sesiones vencidas guardadas en el navegador', () => {
    localStorage.setItem('access_token', jwt(1));
    localStorage.setItem('auth_user', JSON.stringify(user));
    const restored = TestBed.runInInjectionContext(() => new AuthService());
    expect(restored.getToken()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });
  it('muestra el mensaje del backend al rechazar credenciales', () => {
    let message = '';
    auth.login({ email: user.email, password: 'incorrecta' }).subscribe({ error: error => message = error.message });
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(
      { success: false, message: 'Credenciales invalidas' }, { status: 401, statusText: 'Unauthorized' },
    );
    expect(message).toBe('Credenciales invalidas');
    expect(auth.getToken()).toBeNull();
  });
  for (const status of [401, 403]) {
    it(`cierra la sesión y redirige a auth ante HTTP ${status}`, () => {
      login();
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      client.get(`${environment.apiUrl}/empleados`).subscribe({ error: () => {} });
      http.expectOne(`${environment.apiUrl}/empleados`).flush({}, { status, statusText: 'Denied' });
      expect(auth.getToken()).toBeNull();
      expect(navigate).toHaveBeenCalledWith(['/auth']);
    });
  }
});
