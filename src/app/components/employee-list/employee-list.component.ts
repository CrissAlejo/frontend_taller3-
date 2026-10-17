import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Empleado } from '../../models/empleado';

@Component({ selector: 'app-employee-list', templateUrl: './employee-list.component.html' })
export class EmployeeListComponent {
  @Input() employees: readonly Empleado[] = [];
  @Input() busy = false;
  @Output() readonly edit = new EventEmitter<Empleado>();
  @Output() readonly remove = new EventEmitter<Empleado>();
  trackById(_index: number, employee: Empleado): string { return employee._id; }
}
