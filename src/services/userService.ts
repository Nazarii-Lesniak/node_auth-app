import { User, PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './emailService';
import { tokenService } from './tokenService';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export type NormalizedUser = {
  id: number;
  email: string;
};

function normalize({ id, email }: User): NormalizedUser {
  return { id, email };
}

function getAllActive(): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      isActivated: true,
    },
  });
}

function getByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

function validateEmail(email: string) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password: string) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

async function register({
  email,
  password,
  name,
}: Pick<User, 'email' | 'password' | 'name'>) {
  const emailError = validateEmail(email);

  if (emailError) {
    throw new Error(emailError);
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw new Error(passwordError);
  }

  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      activationToken,
    },
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function activation({
  email,
  activationToken,
}: Pick<User, 'email' | 'activationToken'>) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.activationToken !== activationToken) {
    throw new Error('Invalid activation token');
  }

  if (user.isActivated) {
    throw new Error('User already activated');
  }

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      isActivated: true,
      activationToken: null,
    },
  });
}

async function login({ email, password }: Pick<User, 'email' | 'password'>) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActivated) {
    throw new Error('User is not activated');
  }

  return normalize(user);
}

async function resetPassword({ email }: Pick<User, 'email'>) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const resetPasswordToken = tokenService.generateRandomToken();
  const expiryDate = new Date();

  expiryDate.setHours(expiryDate.getHours() + 1);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      resetPasswordToken,
      resetPasswordExpires: expiryDate,
    },
  });

  emailService.sendResetPasswordEmail(email, resetPasswordToken);
}

async function confirmResetPassword({
  email,
  password,
  resetPasswordToken,
}: Pick<User, 'email' | 'password' | 'resetPasswordToken'>) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.resetPasswordToken !== resetPasswordToken) {
    throw new Error('Invalid reset password token');
  }

  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    throw new Error('Reset password token expired');
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
}

async function updateProfile(
  { email, password, name }: Pick<User, 'email' | 'password' | 'name'>,
  newPassword: string,
  newEmail: string,
) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  if (name) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        name,
      },
    });
  }

  if (password && newPassword) {
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      throw new Error(passwordError);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hash,
      },
    });
  }

  if (newEmail) {
    if (!password) {
      throw new Error('Password is required to change email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    emailService.sendMessageToChangeEmail(email);

    const activationToken = uuidv4();

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        email: newEmail,
        isActivated: false,
        activationToken,
      },
    });

    emailService.sendActivationEmail(newEmail, activationToken);
  }
}

export const userService = {
  normalize,
  getAllActive,
  getByEmail,
  register,
  validateEmail,
  validatePassword,
  activation,
  login,
  resetPassword,
  confirmResetPassword,
  updateProfile,
};
