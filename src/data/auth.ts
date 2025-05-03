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
 * Verify if the provided credentials are valid
 * @param email User email
 * @param password User password
 * @returns Boolean indicating if credentials are valid
 */
export function verifyCredentials(email: string, password: string): boolean {
  return validCredentials.some(
    (cred) => cred.email === email && cred.password === password
  );
} 