import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Get environment variables
const JWT_SECRET = (process.env.JWT_SECRET as string);
const AUTH_USERNAME = (process.env.AUTH_USERNAME as string);
const AUTH_PASSWORD = (process.env.AUTH_PASSWORD as string);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

if (!AUTH_USERNAME || !AUTH_PASSWORD) {
  throw new Error(
    "AUTH_USERNAME and AUTH_PASSWORD environment variables are required"
  );
}

/**
 * Generate a JWT token for the given username
 */
export function generateToken(username: string): string {
  return jwt.sign(
    { username, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET as string,
    { expiresIn: "7d", algorithm: "HS256" } // Token expires in 7 days
  );
}

/**
 * Verify a JWT token and return the username if valid
 */
export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET as string
    ) as jwt.JwtPayload & { username: string };
    return decoded.username;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Check if the provided password matches the hashed password
 */
export async function checkPassword(
  input: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(input, hash);
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(
  username: string,
  password: string
): Promise<boolean> {
  if (username !== AUTH_USERNAME) {
    return false;
  }

  return await checkPassword(password, AUTH_PASSWORD);
}

/**
 * Hash a password using bcrypt (utility function for generating hashed passwords)
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}
