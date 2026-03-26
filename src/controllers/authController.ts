import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { userService } from '../services/userService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { validationUtil } from '../utils/validation.js';
import { tokenService } from '../services/tokenService.js';

async function register(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email, password, name } = request.body;

    const errors = {
      email: validationUtil.validateEmail(email),
      password: validationUtil.validatePassword(password),
    };

    if (errors.email || errors.password) {
      throw ApiError.BadRequest('Validation error', errors);
    }

    await userService.register({ email, password, name });

    response.send({ message: 'User registered. Please check your email.' });
  } catch (error) {
    next(error);
  }
}

async function activate(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email, activationToken } = request.params;

    await userService.activation({
      email: String(email),
      activationToken: String(activationToken),
    });

    const user = await userService.getByEmail(String(email));

    if (!user) {
      throw ApiError.NotFound();
    }

    const normalizedUzer = userService.normalize(user);

    const refreshToken = tokenService.generateRefreshToken(normalizedUzer);

    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    response.redirect(`${process.env.CLIENT_URL}/profile`);
  } catch (error) {
    next(error);
  }
}

async function login(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email, password } = request.body;

    const user = await userService.login({ email, password });
    const refreshToken = tokenService.generateRefreshToken(user);

    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    response.redirect(`${process.env.CLIENT_URL}/profile`);
  } catch (error) {
    next(error);
  }
}

async function logout(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    response.clearCookie('refreshToken');
    response.redirect(`${process.env.CLIENT_URL}/`);
  } catch (error) {
    next(error);
  }
}

async function resetPasswordRequest(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email } = request.body;

    await userService.resetPassword({ email });
    response.redirect(`${process.env.CLIENT_URL}/login`);
  } catch (error) {
    next(error);
  }
}

async function resetPasswordConfirm(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email, password, resetPasswordToken, confirmation } = request.body;

    if (password !== confirmation) {
      throw ApiError.BadRequest('Passwords do not match');
    }

    await userService.confirmResetPassword({
      email,
      password,
      resetPasswordToken,
    });

    response.redirect(`${process.env.CLIENT_URL}/login`);
  } catch (error) {
    next(error);
  }
}

export const authController = {
  register,
  activate,
  login,
  logout,
  resetPasswordRequest,
  resetPasswordConfirm,
};
