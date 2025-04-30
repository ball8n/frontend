// Authentication credentials
export interface Credentials {
  email: string;
  password: string;
}

export const validCredentials: Credentials[] = [
  {
    email: "ryan@balloon.de",
    password: "berlin"
  }
];

/**
 * Checks whether the given email and password match any valid credentials.
 *
 * @param email - The email address to verify.
 * @param password - The password to verify.
 * @returns True if the credentials are valid; otherwise, false.
 */
export function verifyCredentials(email: string, password: string): boolean {
  return validCredentials.some(
    (cred) => cred.email === email && cred.password === password
  );
} 