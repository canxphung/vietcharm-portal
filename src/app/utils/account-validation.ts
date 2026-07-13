/** Shared account-input rules for the auth page and auth modal. */

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** VN phone: starts with 0, exactly 10 digits. */
export const PHONE_PATTERN = /^0\d{9}$/;

/** At least 4 chars; letters, digits, dot or underscore only. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9._]{4,}$/;

/** Password policy: at least 8 chars containing both letters and digits. */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}
