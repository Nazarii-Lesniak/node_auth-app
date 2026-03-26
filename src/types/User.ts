export type NormalizedUser = { id: number; email: string };

export function isNormalizedUser(user: any): user is NormalizedUser {
  if (
    user !== null &&
    typeof user === 'object' &&
    typeof user.id === 'number' &&
    typeof user.email === 'string'
  ) {
    return true;
  }

  return false;
}
