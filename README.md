# Frontend

## Actividad PDA05: autenticación JWT

El frontend usa `POST ${API_URL}/auth/login` con `{ email, password }` y espera
`{ success: true, data: { token, user: { email, rol } } }`, según el backend existente.
No se modificó el backend.

- `/auth`: formulario de acceso con validación y mensajes del backend.
- `/employees`: CRUD protegido por un guard; sin sesión redirige a `/auth`.
- `AuthService`: sesión reactiva y persistencia en `localStorage`, compatible con SSR.
- Interceptor: añade `Authorization: Bearer` solo a esta API; ante 401/403
  limpia la sesión y regresa a `/auth`.
- El botón «Cerrar sesión» elimina los datos de sesión y vuelve al login.

Para probar, inicia el backend y ejecuta `npm start`. Entra directamente a
`/employees` sin sesión, verifica la redirección y accede con un usuario ya creado
en tu backend. Después prueba el CRUD, recarga la página y cierra la sesión.
Las pruebas automatizadas se ejecutan con `npm test -- --watch=false --browsers=ChromeHeadless`.

La URL del backend se configura en `.env` (ver `.env.example`):

```env
API_URL=http://localhost:3000/api
```

`npm start` y `npm run build` cargan esa URL antes de ejecutar Angular.
Tras cambiarla, reinicia el servidor o vuelve a compilar y desplegar.
Esta URL queda visible en el navegador; no coloques secretos en ella.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.1.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
