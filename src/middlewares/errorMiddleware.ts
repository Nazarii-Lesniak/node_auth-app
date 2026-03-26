import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { ApiError } from '../exceptions/ApiError.js';

export function errorMiddleware(
  error: Error,
  request: ExpressRequest,
  response: ExpressResponse,
) {
  if (error instanceof ApiError) {
    return response
      .status(error.status)
      .send({ message: error.message, errors: error.errors });
  }

  response.status(500).send({ message: 'Unexpected error' });
}
