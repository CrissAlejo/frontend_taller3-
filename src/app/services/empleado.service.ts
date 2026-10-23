import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, defer, catchError, finalize, map, tap, throwError } from 'rxjs';
import { ApiResponse, Empleado, EmployeeInput } from '../models/empleado';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly url = `${environment.apiUrl}/empleados`;
  private readonly employeesSubject = new BehaviorSubject<readonly Empleado[]>(Object.freeze([]));
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly loadingSubject = new BehaviorSubject(false);
  private pending = 0;
  readonly employees$ = this.employeesSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  constructor(private readonly http: HttpClient) {}
  load(): Observable<Empleado[]> {
    return this.request(this.http.get<ApiResponse<Empleado[]>>(this.url)).pipe(
      tap(employees => this.publish(employees)),
    );
  }
  create(input: EmployeeInput): Observable<Empleado> {
    return this.request(this.http.post<ApiResponse<Empleado>>(this.url, input)).pipe(
      tap(employee => this.publish([...this.employeesSubject.value, employee])),
    );
  }
  update(id: string, input: EmployeeInput): Observable<Empleado> {
    return this.request(this.http.put<ApiResponse<Empleado>>(`${this.url}/${id}`, input)).pipe(
      tap(employee => this.publish(this.employeesSubject.value.map(current => current._id === id ? employee : current))),
    );
  }
  delete(id: string): Observable<boolean> {
    return this.request(this.http.delete<ApiResponse<boolean>>(`${this.url}/${id}`)).pipe(
      tap(() => this.publish(this.employeesSubject.value.filter(employee => employee._id !== id))),
    );
  }
  private publish(employees: readonly Empleado[]): void {
    this.employeesSubject.next(Object.freeze(employees.map(employee => Object.freeze({ ...employee }))));
  }
  private request<T>(source: Observable<ApiResponse<T>>): Observable<T> {
    return defer(() => {
      this.errorSubject.next(null);
      this.pending++;
      this.loadingSubject.next(true);
      return source.pipe(
        map(response => {
          if (!response.success) throw new Error(response.message);
          return response.data;
        }),
        catchError((error: unknown) => {
          const message = error instanceof HttpErrorResponse
            ? (error.status === 0 ? 'No se pudo conectar con el servidor' : error.error?.message ?? 'No se pudo completar la operacion')
            : (error instanceof Error ? error.message : 'Error inesperado');
          this.errorSubject.next(message);
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(--this.pending > 0)),
      );
    });
  }
}
export { EmployeeService as EmpleadoService };
