import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { EmployeeService } from '../../services/empleado.service';
import { Empleado, EmployeeInput } from '../../models/empleado';

@Component({ selector: 'app-empleado', templateUrl: './empleado.component.html', styleUrl: './empleado.component.css' })
export class EmpleadoComponent implements OnInit {
  private readonly service = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);
  readonly employees$ = this.service.employees$;
  readonly error$ = this.service.error$;
  readonly loading$ = this.service.loading$;
  selected: Empleado | null = null;
  formVersion = 0;
  ngOnInit(): void { this.execute(this.service.load()); }
  save(input: EmployeeInput): void {
    this.execute(this.selected ? this.service.update(this.selected._id, input) : this.service.create(input), () => this.cancel());
  }
  remove(employee: Empleado): void {
    this.execute(this.service.delete(employee._id), () => {
      if (this.selected?._id === employee._id) this.cancel();
    });
  }
  cancel(): void { this.selected = null; this.formVersion++; }
  private execute<T>(request: Observable<T>, onSuccess?: () => void): void {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => onSuccess?.(), error: () => {} });
  }
}
