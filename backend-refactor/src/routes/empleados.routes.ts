import { Router } from 'express';
import type { IEmployeeRepository } from '../repositories/employee.repository.js';
import { createEmployeeController } from '../controllers/empleados.controllers.js';

export function createEmployeeRouter(repository: IEmployeeRepository) {
  const router = Router();
  const controller = createEmployeeController(repository);
  router.get('/empleados', controller.getEmpleado);
  router.post('/empleados', controller.addEmpleado);
  router.put('/empleados/:id', controller.updateEmpleado);
  router.delete('/empleados/:id', controller.deleteEmpleado);
  return router;
}
