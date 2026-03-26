import { Router } from 'express';
import { authController } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.get('/activation/:email/:activationToken', authController.activate);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/reset-password', authController.resetPasswordRequest);
authRouter.post('/reset-password/confirm', authController.resetPasswordConfirm);
