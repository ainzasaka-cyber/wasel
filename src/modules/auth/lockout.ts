export const MAX_LOGIN_FAILURES = 8;
export const LOCKOUT_MINUTES = 15;

export function nextLoginFailure(failures: number, now = new Date()): { failedLoginCount: number; lockedUntil: Date | null } {
  const failedLoginCount = failures + 1;
  return {
    failedLoginCount,
    lockedUntil: failedLoginCount >= MAX_LOGIN_FAILURES ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000) : null,
  };
}

export function isLoginLocked(lockedUntil: Date | null | undefined, now = new Date()): boolean {
  return Boolean(lockedUntil && lockedUntil.getTime() > now.getTime());
}
