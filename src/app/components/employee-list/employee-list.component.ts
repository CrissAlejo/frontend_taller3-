import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Empleado } from '../../models/empleado';

@Component({ selector: 'app-employee-list', templateUrl: './employee-list.component.html' })
export class EmployeeListComponent implements OnChanges {
  @Input() employees: readonly Empleado[] = [];
  @Input() busy = false;
  @Output() readonly edit = new EventEmitter<Empleado>();
  @Output() readonly remove = new EventEmitter<Empleado>();
  readonly pageSize = 5;
  private requestedPage = 1;
  ngOnChanges(): void { this.requestedPage = this.page; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.employees.length / this.pageSize)); }
  get page(): number { return Math.min(this.requestedPage, this.totalPages); }
  get firstItem(): number { return this.employees.length ? (this.page - 1) * this.pageSize + 1 : 0; }
  get lastItem(): number { return Math.min(this.page * this.pageSize, this.employees.length); }
  get visibleEmployees(): readonly Empleado[] {
    return this.employees.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }
  goToPage(page: number): void {
    if (!this.busy) this.requestedPage = Math.max(1, Math.min(page, this.totalPages));
  }
  trackById(_index: number, employee: Empleado): string { return employee._id; }
}
