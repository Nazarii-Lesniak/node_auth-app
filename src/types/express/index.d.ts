// src/types/express/index.d.ts
import { NormalizedUser } from '../User.ts';

declare module 'express-serve-static-core' {
  // eslint-disable-next-line no-shadow
  interface Request {
    user?: NormalizedUser;
  }
}
