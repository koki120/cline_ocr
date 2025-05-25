import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const envPath = path.resolve(process.cwd(), ".env");

function generatePassword(length = 16) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

function generateUsername() {
  const id = crypto.randomBytes(4).toString("hex");
  return `user_${id}`;
}

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

// 値生成
const username = generateUsername();
const password = generatePassword();
const passwordHash = bcrypt.hashSync(password, 10);
const jwtSecret = generateSecret();

if (passwordHash.length !== 60) {
  throw new Error("⚠ bcrypt ハッシュ長が異常です: " + passwordHash.length);
}

// .env の内容を完全に置き換える
const newEnvContent =
  [
    `AUTH_USERNAME=${username}`,
    `AUTH_PASSWORD=${passwordHash}`,
    `JWT_SECRET=${jwtSecret}`,
  ].join("\n") + "\n";

// 書き込み
fs.writeFileSync(envPath, newEnvContent, { encoding: "utf-8" });

console.log("✅ .env ファイルを完全に再生成しました。\n");
console.log("🆔 ユーザー名:", username);
console.log("🔐 平文パスワード（控えてください）:", password);
console.log("🔒 bcryptハッシュ:", passwordHash);
console.log("🧪 ハッシュ長さ:", passwordHash.length); // 必ず 60
