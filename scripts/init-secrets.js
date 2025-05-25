/**
 * Securely generate AUTH_USERNAME, AUTH_PASSWORD and JWT_SECRET and update .env file
 * Usage: node scripts/update-env-secrets.js
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// eslint-disable-next-line no-undef
const envPath = path.resolve(process.cwd(), ".env");

function generatePassword(length = 16) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[+/=]/g, "")
    .slice(0, length);
}

function generateUsername() {
  const id = crypto.randomBytes(4).toString("hex"); // 8文字
  return `user_${id}`;
}

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

// 値生成
const username = generateUsername();
const password = generatePassword();
const passwordHash = bcrypt.hashSync(password, 12);
const jwtSecret = generateSecret();

// .env 読み取り
let env = "";
try {
  env = fs.readFileSync(envPath, "utf-8");
} catch {
  console.warn("⚠️ .envファイルが存在しないため、新規作成します。");
}

// 行ごとの置換
let updatedUsername = false;
let updatedAuth = false;
let updatedJwt = false;

const newEnv = env.split("\n").map((line) => {
  if (line.startsWith("AUTH_USERNAME=")) {
    updatedUsername = true;
    return `AUTH_USERNAME=${username}`;
  }
  if (line.startsWith("AUTH_PASSWORD=")) {
    updatedAuth = true;
    return `AUTH_PASSWORD=${passwordHash}`;
  }
  if (line.startsWith("JWT_SECRET=")) {
    updatedJwt = true;
    return `JWT_SECRET=${jwtSecret}`;
  }
  return line;
});

if (!updatedUsername) newEnv.push(`AUTH_USERNAME=${username}`);
if (!updatedAuth) newEnv.push(`AUTH_PASSWORD=${passwordHash}`);
if (!updatedJwt) newEnv.push(`JWT_SECRET=${jwtSecret}`);

fs.writeFileSync(envPath, newEnv.join("\n"), "utf-8");

console.log("✅ .env ファイルを更新しました。\n");
console.log("🆔 新しいユーザー名: ", username);
console.log("🔐 新しい平文パスワード（控えてください）:", password);
