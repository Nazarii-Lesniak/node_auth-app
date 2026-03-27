import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { userService } from '../services/userService.js';
import { ApiError } from '../exceptions/ApiError.js';

async function getProfile(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;

    const user = await userService.getByEmail(email);

    response.render('profile', { user, error: null });
  } catch (error) {
    next(error);
  }
}

async function updateName(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;
    const { name } = request.body;

    await userService.updateProfile({ email, name });
    response.redirect('/user/profile');
  } catch (error) {
    next(error);
  }
}

async function updatePassword(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;
    const { newPassword, oldPassword, confirmation } = request.body;

    if (newPassword !== confirmation) {
      throw ApiError.BadRequest();
    }

    await userService.updateProfile(
      { email, password: oldPassword },
      newPassword,
    );
    response.redirect('/user/profile');
  } catch (error) {
    next(error);
  }
}

async function updateEmail(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;
    const { password, newEmail } = request.body;

    await userService.updateProfile({ email, password }, undefined, newEmail);
    response.redirect('/user/profile');
  } catch (error) {
    next(error);
  }
}

export const userController = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
