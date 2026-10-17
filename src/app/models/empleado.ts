export interface EmployeeInput {
  readonly nombre: string;
  readonly cargo: string;
  readonly departamento: string;
  readonly sueldo: number;
}
export interface Empleado extends EmployeeInput {
  readonly _id: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
export type ApiResponse<T> =
  | { success: true; data: T; message: string; errors: { path: string; message: string }[] }
  | { success: false; data: null; message: string; errors: { path: string; message: string }[] };
