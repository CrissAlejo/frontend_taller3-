import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Empleado, EmployeeInput } from '../../models/empleado';

@Component({ selector: 'app-employee-form', templateUrl: './employee-form.component.html' })
export class EmployeeFormComponent implements OnChanges {
  @Input() employee: Empleado | null = null;
  @Input() busy = false;
  @Input() resetVersion = 0;
  @Output() readonly save = new EventEmitter<EmployeeInput>();
  @Output() readonly cancel = new EventEmitter<void>();
  @ViewChild('form') form?: NgForm;
  draft = this.empty();
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['employee'] && !changes['resetVersion']) return;
    this.draft = this.employee ? {
      nombre: this.employee.nombre, cargo: this.employee.cargo,
      departamento: this.employee.departamento, sueldo: this.employee.sueldo,
    } : this.empty();
    this.form?.resetForm(this.draft);
  }
  submit(form: NgForm): void {
    if (form.invalid || this.busy) return;
    this.save.emit({ ...this.draft });
  }
  private empty() { return { nombre: '', cargo: '', departamento: '', sueldo: 0 }; }
}
