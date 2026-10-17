import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { EmpleadoService } from './empleado.service';
import { Empleado } from '../models/empleado';

describe('EmployeeService', () => {
  let service: EmpleadoService;
  let http: HttpTestingController;
  const url = 'http://localhost:3000/api/empleados';
  const employee: Empleado = { _id: '0123456789abcdef01234567', nombre: 'Ana', cargo: 'Ingeniera', departamento: 'TI', sueldo: 1000 };
  const wrap = <T>(data: T) => ({ success: true, data, message: 'OK', errors: [] });
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(EmpleadoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('publica nuevas referencias en CRUD sin modificar emisiones previas', () => {
    const emissions: (readonly Empleado[])[] = [];
    const subscription = service.employees$.subscribe(value => emissions.push(value));
    service.load().subscribe();
    http.expectOne(url).flush(wrap([employee]));
    const input = { nombre: 'Luis', cargo: 'QA', departamento: 'TI', sueldo: 500 };
    service.create(input).subscribe();
    http.expectOne(url).flush(wrap({ ...input, _id: 'other' }));
    service.update(employee._id, { ...input, sueldo: 2000 }).subscribe();
    http.expectOne(`${url}/${employee._id}`).flush(wrap({ ...input, sueldo: 2000, _id: employee._id }));
    service.delete('other').subscribe();
    http.expectOne(`${url}/other`).flush(wrap(true));
    expect(emissions.map(rows => rows.length)).toEqual([0, 1, 2, 2, 1]);
    expect(emissions[1][0].sueldo).toBe(1000);
    expect(emissions[3][0].sueldo).toBe(2000);
    expect(Object.isFrozen(emissions[1])).toBeTrue();
    expect(Object.isFrozen(emissions[1][0])).toBeTrue();
    expect(emissions[1]).not.toBe(emissions[2]);
    subscription.unsubscribe();
  });
  it('un fallo conserva el estado, publica error y termina la carga', () => {
    let rows: readonly Empleado[] = [];
    let message: string | null = null;
    let loading = false;
    service.employees$.subscribe(value => rows = value);
    service.error$.subscribe(value => message = value);
    service.loading$.subscribe(value => loading = value);
    service.load().subscribe();
    http.expectOne(url).flush(wrap([employee]));
    service.delete(employee._id).subscribe({ error: (error: HttpErrorResponse) => expect(error.status).toBe(500) });
    expect(loading).toBeTrue();
    http.expectOne(`${url}/${employee._id}`).flush({ success: false, data: null, message: 'Error interno', errors: [] }, { status: 500, statusText: 'Server Error' });
    expect(rows).toEqual([employee]);
    expect<string | null>(message).toBe('Error interno');
    expect(loading).toBeFalse();
  });
});
