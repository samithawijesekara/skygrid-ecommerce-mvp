import jwt, { Secret, SignOptions } from "jsonwebtoken";
import CONFIGURATIONS from "@/configurations/configurations";

const JWT_SECRET: Secret = CONFIGURATIONS.JWT.SECRET;

/**
 * Generates a JWT token for password reset or authentication.
 * @param payload - User data for token
 * @returns JWT token
 */
export const generateJwtToken = (
  payload: Record<string, unknown>,
  expirationTime?: number
): string => {
  const options: SignOptions = {
    expiresIn: expirationTime,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verifies and decodes a JWT token.
 * @param token - The JWT token to verify and decode
 * @returns Decoded token payload if valid, or null if invalid or expired
 */
export function verifyJwtToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as any; // Adjust based on your token structure
  } catch (error) {
    return null;
  }
}
