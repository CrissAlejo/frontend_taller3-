# Refactorización por hitos

El frontend está en esta carpeta. El backend activo está en `../code/backend`.
`backend-refactor/` conserva los archivos de backend preparados para esta entrega;
ya se aplicaron al backend activo. Esa carpeta es un conjunto de cambios, no un
proyecto ejecutable independiente: utiliza el modelo, la conexión y las dependencias
del backend existente.

## Reto 1: Repository e inversión de dependencias

`domain/employee.ts` define datos independientes de Express y Mongoose.
`repositories/employee.repository.ts` declara `IEmployeeRepository`.
`MongooseEmployeeRepository` implementa el contrato y transforma documentos en
objetos simples, con identificadores y fechas serializados.

`createEmployeeController(repository)` recibe únicamente la interfaz. No importa
modelos ni Mongoose. `createApp(repository)` permite sustituir la persistencia.
`index.ts` es el punto de composición: conecta la base y elige el repositorio real.
Las pruebas HTTP usan un repositorio en memoria y no requieren MongoDB.

## Reto 2: DTO y respuesta universal

`dtos/employee.dto.ts` usa Zod para validar el cuerpo antes de persistir y los
parámetros antes de consultar. Rechaza propiedades desconocidas, campos vacíos,
nombre de menos de tres caracteres, sueldos negativos o enviados como texto e IDs
que no tengan 24 caracteres hexadecimales. PUT requiere todos los campos.

Todas las respuestas JSON comparten esta estructura:

```json
{ "success": true, "data": [], "message": "Operacion exitosa", "errors": [] }
```

Los fallos usan `success: false`, `data: null` y un mensaje seguro. Los errores de
validación incluyen `errors: [{ "path": "sueldo", "message": "..." }]`.
El middleware global trata validación (400), JSON inválido (400), ausencia (404),
cuerpos demasiado grandes (413) y fallos internos (500). Los detalles internos
solo se registran en el servidor.

| Operación | Ruta | Éxito |
| --- | --- | --- |
| Listar | `GET /api/empleados` | 200, lista |
| Crear | `POST /api/empleados` | 201, empleado creado |
| Actualizar | `PUT /api/empleados/:id` | 200, empleado actualizado |
| Eliminar | `DELETE /api/empleados/:id` | 200, booleano |

## Reto 3: estado reactivo e inmutable

`EmployeeService` centraliza HttpClient y expone `employees$`, `loading$` y
`error$` mediante `asObservable()`. Los BehaviorSubject son privados.
Crear usa `[...current, employee]`; actualizar usa `map`; eliminar usa `filter`.
Las emisiones se congelan junto con sus objetos para evitar mutaciones externas.
Un error HTTP conserva el estado anterior y publica un mensaje para la vista.
`EmpleadoService` se conserva como alias de la misma clase para compatibilidad.

## Reto 4: Smart y Dumb Components

`EmpleadoComponent` orquesta carga y comandos; consume el estado con `async`.
`EmployeeFormComponent` recibe empleado y estado de carga, mantiene un borrador
propio y emite `save`/`cancel`.
`EmployeeListComponent` recibe la lista y emite `edit`/`remove`.
Los componentes presentacionales no inyectan servicios ni hacen peticiones HTTP.
Las suscripciones de comandos se limpian al destruir el orquestador.

## Ejecución y comprobación

En el backend:

```powershell
npm.cmd run dev
npm.cmd run typecheck
npm.cmd test
node node_modules/tsx/dist/cli.mjs --test tests/employee-api.test.ts
```

En el frontend:

```powershell
npm.cmd start
npm.cmd run build -- --configuration development
npm.cmd test -- --watch=false --browsers=ChromeHeadless
```

El servicio utiliza `http://localhost:3000/api/empleados` para el entorno local.
La configuración de URL para despliegue queda pendiente del destino de hosting.

Referencia: [validación y manejo de errores con Zod](https://zod.dev/basics).
