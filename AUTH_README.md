# 認証システム - Authentication System

このドキュメントでは、Textbook OCR Appに追加された認証機能について説明します。

## 🔐 概要

- **認証方式**: JWT（JSON Web Token）ベースの認証
- **パスワード暗号化**: bcryptを使用したハッシュ化
- **セッション期間**: 7日間
- **対象**: 個人利用を想定した強固な認証システム

## 📁 追加されたファイル

```
app/
├── lib/
│   └── auth.server.ts           # JWT発行・検証、パスワード認証ロジック
├── routes/
│   ├── login.tsx                # ログイン画面
│   ├── logout.tsx               # ログアウト処理
│   ├── api.auth.login.ts        # 認証API（POST）
│   └── protected/
│       └── editor.tsx           # 認証ガード付きエディターページ
└── scripts/
    └── generate-password-hash.js # パスワードハッシュ生成ユーティリティ
```

## ⚙️ セットアップ手順

### 1. 環境変数の設定

`.env`ファイルを作成し、以下の変数を設定してください：

```env
# JWT秘密鍵（本番環境では強力なランダム文字列を使用）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 認証情報
AUTH_USERNAME=admin
AUTH_PASSWORD=$2b$10$rOvsFwjNn.MmLWmBp7vBu.QVY/y8Cz8qRg6FvFdBdHxKZGvvb6/Gy
```

### 2. パスワードハッシュの生成

新しいパスワードのハッシュを生成するには：

```bash
# デフォルトパスワード（password123）のハッシュを生成
node scripts/generate-password-hash.js

# カスタムパスワードのハッシュを生成
node scripts/generate-password-hash.js "your-secure-password"
```

### 3. デフォルト認証情報

`.env.example`に含まれているデフォルト認証情報：

- **ユーザー名**: `admin`
- **パスワード**: `password123`

**⚠️ 本番環境では必ず変更してください！**

## 🔒 認証フロー

### ログイン
1. ユーザーが `/login` にアクセス
2. ユーザー名とパスワードを入力
3. サーバーで認証情報を検証
4. 成功時、JWTトークンをHttpOnlyクッキーに設定
5. `/protected/editor` にリダイレクト

### 認証ガード
1. 保護されたページにアクセス時
2. クッキーからJWTトークンを取得
3. トークンの有効性を検証
4. 無効な場合は `/login` にリダイレクト

### ログアウト
1. `/logout` にPOSTリクエスト
2. 認証クッキーを削除
3. ホームページにリダイレクト

## 🛡️ セキュリティ機能

### クッキー設定
- `HttpOnly`: JavaScriptからアクセス不可
- `Secure`: HTTPS接続でのみ送信
- `SameSite=Strict`: CSRF攻撃を防止
- `Max-Age`: 7日間で自動期限切れ

### パスワード保護
- bcryptによる強力なハッシュ化（ソルトラウンド: 10）
- 平文パスワードは保存されない

### JWT トークン
- 7日間の有効期限
- 秘密鍵による署名検証

## 🚀 使用方法

### 1. アプリケーションの起動
```bash
npm run dev
```

### 2. ログイン
- ブラウザで `http://localhost:3000/login` にアクセス
- デフォルト認証情報でログイン：
  - ユーザー名: `admin`
  - パスワード: `password123`

### 3. 保護されたページへのアクセス
- ログイン後、`/protected/editor` にアクセス可能
- ホームページの「編集履歴」ボタンからもアクセス可能

### 4. ログアウト
- 保護されたページのヘッダーにある「ログアウト」ボタンをクリック

## 🔧 カスタマイズ

### 認証情報の変更
1. 新しいパスワードのハッシュを生成：
   ```bash
   node scripts/generate-password-hash.js "new-password"
   ```

2. `.env`ファイルを更新：
   ```env
   AUTH_USERNAME=your-username
   AUTH_PASSWORD=generated-hash
   ```

### JWT設定の変更
`app/lib/auth.server.ts`でトークンの有効期限を変更可能：

```typescript
export function generateToken(username: string): string {
  return jwt.sign(
    { username, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET as string,
    { expiresIn: '30d' } // 30日間に変更
  );
}
```

## 🐛 トラブルシューティング

### よくある問題

1. **「JWT_SECRET environment variable is required」エラー**
   - `.env`ファイルに`JWT_SECRET`が設定されているか確認

2. **ログインできない**
   - ユーザー名とパスワードが正しいか確認
   - `.env`ファイルの`AUTH_PASSWORD`が正しいハッシュか確認

3. **認証が保持されない**
   - ブラウザのクッキーが有効になっているか確認
   - HTTPS環境でない場合、`Secure`属性を削除する必要がある場合があります

### デバッグ方法

開発者ツールのコンソールでエラーメッセージを確認：
```javascript
// ブラウザのコンソールで認証状態を確認
document.cookie
```

## 📝 API エンドポイント

### POST /api/auth/login
認証API

**リクエスト:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**レスポンス（成功）:**
```json
{
  "success": true,
  "message": "ログインに成功しました"
}
```

**レスポンス（失敗）:**
```json
{
  "error": "ユーザー名またはパスワードが正しくありません"
}
```

### POST /logout
ログアウト処理（フォーム送信）

## 🔄 今後の拡張可能性

- 複数ユーザー対応
- パスワードリセット機能
- 2要素認証（2FA）
- セッション管理の改善
- ログイン試行回数制限

---

**注意**: このシステムは個人利用を想定しています。本番環境での使用時は、追加のセキュリティ対策を検討してください。
