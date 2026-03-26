import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { ApiError } from '../exceptions/ApiError.js';
import { tokenService } from '../services/tokenService.js';
import { isNormalizedUser } from '../types/User.js';

export function authMiddleware(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw ApiError.Unauthorized();
    }

    const [, accessToken] = authHeader.split(' ');

    if (!accessToken) {
      throw ApiError.Unauthorized();
    }

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData || !isNormalizedUser(userData)) {
      throw ApiError.Unauthorized();
    }

    request.user = userData;

    next();
  } catch {
    next(ApiError.Unauthorized());
  }
}
