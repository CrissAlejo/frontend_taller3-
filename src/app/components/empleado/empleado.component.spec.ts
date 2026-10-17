import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmpleadoComponent } from './empleado.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeListComponent } from '../employee-list/employee-list.component';

describe('EmpleadoComponent', () => {
  let fixture: ComponentFixture<EmpleadoComponent>;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, HttpClientTestingModule],
      declarations: [EmpleadoComponent, EmployeeFormComponent, EmployeeListComponent],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EmpleadoComponent);
    fixture.detectChanges();
    http.expectOne('http://localhost:3000/api/empleados').flush({ success: true, data: [], message: 'OK', errors: [] });
    fixture.detectChanges();
  });
  afterEach(() => http.verify());
  it('renderiza formulario y lista desde el orquestador', () => {
    expect(fixture.nativeElement.querySelector('app-employee-form')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-employee-list').textContent).toContain('No hay empleados');
  });
});
