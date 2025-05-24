import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Get environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!AUTH_USERNAME || !AUTH_PASSWORD) {
  throw new Error('AUTH_USERNAME and AUTH_PASSWORD environment variables are required');
}

/**
 * Generate a JWT token for the given username
 */
export function generateToken(username: string): string {
  return jwt.sign(
    { username, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET as string,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

/**
 * Verify a JWT token and return the username if valid
 */
export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as jwt.JwtPayload & { username: string };
    return decoded.username;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if the provided password matches the hashed password
 */
export function checkPassword(input: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(input, hash);
  } catch (error) {
    console.error('Password check failed:', error);
    return false;
  }
}

/**
 * Authenticate user with username and password
 */
export function authenticateUser(username: string, password: string): boolean {
  if (username !== AUTH_USERNAME) {
    return false;
  }

  return checkPassword(password, AUTH_PASSWORD as string);
}

/**
 * Hash a password using bcrypt (utility function for generating hashed passwords)
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}
