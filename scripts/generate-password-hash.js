/**
 * Utility script to generate bcrypt password hashes
 * Usage: node scripts/generate-password-hash.js [password]
 */

/* eslint-env node */

import bcrypt from "bcryptjs";

// Get password from command line argument or use default
const password = process.argv[2] || "password123";

// Generate hash
const hash = bcrypt.hashSync(password, 10);

console.log("Password:", password);
console.log("Bcrypt Hash:", hash);
console.log("\nAdd this to your .env file:");
console.log(`AUTH_PASSWORD=${hash}`);
