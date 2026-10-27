import { EmployeeListComponent } from './employee-list.component';

describe('Paginación de empleados', () => {
  const rows = Array.from({ length: 11 }, (_, id) => ({
    _id: String(id), nombre: `Empleado ${id}`, cargo: 'QA', departamento: 'TI', sueldo: 100,
  }));
  it('distribuye las filas entre páginas sin alterar la lista', () => {
    const component = new EmployeeListComponent();
    component.employees = rows;
    expect(component.visibleEmployees.length).toBe(5);
    component.goToPage(2);
    expect(component.visibleEmployees.map(row => row._id)).toEqual(['5', '6', '7', '8', '9']);
    component.goToPage(3);
    expect(component.visibleEmployees.map(row => row._id)).toEqual(['10']);
    expect(component.firstItem).toBe(11);
    expect(component.lastItem).toBe(11);
    expect(rows.length).toBe(11);
  });
  it('ajusta la página al eliminar la última fila y admite listas vacías', () => {
    const component = new EmployeeListComponent();
    component.employees = rows;
    component.goToPage(3);
    component.employees = rows.slice(0, 10);
    component.ngOnChanges();
    expect(component.page).toBe(2);
    expect(component.visibleEmployees.length).toBe(5);
    component.employees = [];
    component.ngOnChanges();
    expect(component.page).toBe(1);
    expect(component.firstItem).toBe(0);
    expect(component.visibleEmployees).toEqual([]);
  });
});
