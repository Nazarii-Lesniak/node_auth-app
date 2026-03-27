import { Router } from 'express';
import { authController } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.get('/register', authController.renderRegister);
authRouter.get('/login', authController.renderLogin);
authRouter.get('/activation/:email/:activationToken', authController.activate);
authRouter.get('/reset-password', authController.resetPasswordRequest);

authRouter.get(
  '/reset-password/:email/:resetPasswordToken',
  authController.renderResetPasswordConfirm,
);

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/reset-password/confirm', authController.resetPasswordConfirm);
authRouter.post('/reset-password', authController.resetPasswordRequest);
