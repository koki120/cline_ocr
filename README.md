# 📚 Textbook OCR App - 教科書デジタル化アプリ

スマートフォンで教科書を撮影してOCR処理を行い、Markdown形式で高速に電子化するWebアプリケーションです。

![Textbook OCR App](public/logo-light.png)

## 🚀 特徴

- **高速OCR処理**: Google Cloud Vision APIを使用した高精度なテキスト認識
- **Markdown変換**: OCR結果を自動的にMarkdown形式に整形
- **モバイル対応**: スマートフォンのカメラで簡単に撮影・処理
- **編集機能**: OCR結果をリアルタイムで編集可能
- **データ保存**: SQLiteを使用したローカルデータベースでOCR履歴を管理
- **ダウンロード機能**: MarkdownファイルやZIPファイルでの一括ダウンロード

## 🛠️ 技術スタック

### フロントエンド・バックエンド

- **Remix** (v2.16.7) - フルスタックReactフレームワーク
- **TypeScript** (v5.1.6) - 型安全な開発
- **TailwindCSS** (v3.4.4) - ユーティリティファーストCSS
- **Capacitor** (v7.2.0) - モバイルアプリ化対応

### バックエンド・API

- **Google Cloud Vision API** - OCR処理
- **SQLite** (better-sqlite3) - ローカルデータベース
- **Archiver** - ZIPファイル生成

### 開発ツール

- **Vite** (v6.0.0) - 高速ビルドツール
- **ESLint** - コード品質管理
- **PostCSS** - CSS処理

## 📋 セットアップ手順

### 1. 前提条件

- Node.js v20.0.0以上
- Google Cloud Platform アカウント
- Google Cloud Vision API の有効化

### 2. プロジェクトのクローン

```bash
git clone <repository-url>
cd doapp
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成：

```bash
cp .env.example .env
```

`.env` ファイルを編集してGoogle Cloud Vision APIキーを設定：

```env
# Google Cloud Vision API Key
GOOGLE_CLOUD_VISION_API_KEY=your_actual_api_key_here

# Database Configuration
DATABASE_URL=file:./storage/app.db

# App Configuration
NODE_ENV=development
```

### 5. Google Cloud Vision API の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. Cloud Vision API を有効化
4. 認証情報でAPIキーを作成
5. 作成したAPIキーを `.env` ファイルに設定

### 6. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:5173` で起動します。

## 📱 使用方法

### 基本的な使い方

1. **カメラ撮影**
   - 「カメラを起動」ボタンをクリック
   - 教科書のページを画面に映す
   - 「撮影」ボタンでキャプチャ

2. **OCR処理**
   - 撮影後、自動的にOCR処理が開始
   - 処理完了後、Markdown形式のテキストが表示

3. **結果の確認・編集**
   - OCR結果をリアルタイムでプレビュー
   - 「編集履歴」ページで過去の結果を編集可能

4. **ダウンロード**
   - Markdownファイル単体のダウンロード
   - 画像とMarkdownをセットにしたZIPファイルのダウンロード

### 編集機能

- **Markdown Editor**: OCR結果を直接編集
- **プレビュー機能**: 編集内容をリアルタイムで確認
- **履歴管理**: 過去のOCR結果を一覧表示・再編集

## 🏗️ プロジェクト構造

```file
doapp/
├── app/
│   ├── routes/                    # Remixルート
│   │   ├── _index.tsx            # メインページ
│   │   ├── editor.tsx            # 編集ページ
│   │   ├── api.ocr.ts            # OCR API エンドポイント
│   │   ├── api.download-zip.ts   # ZIP ダウンロード API
│   │   └── downloadImage.$filename.tsx # 画像配信
│   ├── components/               # Reactコンポーネント
│   │   ├── CameraCapture.tsx     # カメラ撮影
│   │   ├── MarkdownEditor.tsx    # Markdown編集
│   │   └── OCRPreview.tsx        # OCR結果プレビュー
│   ├── lib/                      # ユーティリティ
│   │   ├── db.server.ts          # データベース操作
│   │   └── visionService.ts      # Vision API連携
│   └── styles/                   # スタイル
├── storage/                      # データ保存
│   ├── app.db                    # SQLiteデータベース
│   └── images/                   # アップロード画像
├── public/                       # 静的ファイル
└── .env                         # 環境変数（要作成）
```

## 🔧 API エンドポイント

### POST /api/ocr

OCR処理を実行

**リクエスト:**

```json
{
  "image_base64": "data:image/png;base64,..."
}
```

**レスポンス:**

```json
{
  "markdown": "# 変換されたMarkdownテキスト",
  "imageFilename": "uuid.png"
}
```

### POST /api/download-zip

ZIPファイルをダウンロード

**リクエスト:**

```json
{
  "ocrResultId": 1,
  "markdown": "編集されたMarkdownテキスト"
}
```

**レスポンス:** ZIPファイル（バイナリ）

## 🧪 テスト

```bash
# リンターの実行
npm run lint

# 型チェック
npm run typecheck

# ビルドテスト
npm run build
```

## 🚀 デプロイ

### Vercel でのデプロイ

1. Vercelアカウントでプロジェクトをインポート
2. 環境変数を設定：
   - `GOOGLE_CLOUD_VISION_API_KEY`
   - `NODE_ENV=production`
3. デプロイ実行

### その他のプラットフォーム

- **Render**: フルスタックRemixアプリ対応
- **Fly.io**: Dockerベースデプロイ
- **Railway**: 簡単デプロイ

### ビルドコマンド

```bash
npm run build
npm start
```

## 🔒 セキュリティ

- APIキーは環境変数で管理
- 画像ファイルサイズ制限（10MB）
- MIME タイプ検証
- SQLインジェクション対策

## 🐛 トラブルシューティング

### よくある問題

1. **OCR処理が失敗する**
   - Google Cloud Vision APIキーが正しく設定されているか確認
   - API の有効化と課金設定を確認

2. **カメラが起動しない**
   - ブラウザのカメラ許可設定を確認
   - HTTPS環境での実行を推奨

3. **画像が表示されない**
   - `storage/images/` ディレクトリの権限を確認
   - ファイルパスの設定を確認

### ログの確認

```bash
# 開発サーバーのログ
npm run dev

# ビルドログ
npm run build
```

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

1. フォークしてブランチを作成
2. 変更を実装
3. テストを実行
4. プルリクエストを作成

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesページでお知らせください。

---

**開発者**: Cline AI Assistant  
**バージョン**: 1.0.0  
**最終更新**: 2025年5月
