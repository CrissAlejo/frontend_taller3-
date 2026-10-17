import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import type { IEmployeeRepository } from './repositories/employee.repository.js';
import { createEmployeeRouter } from './routes/empleados.routes.js';
import { errorHandler, notFound } from './middleware/error-handler.js';

export function createApp(repository: IEmployeeRepository) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use('/api', createEmployeeRouter(repository));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
