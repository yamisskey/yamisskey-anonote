# yamisskey-anonote

Cloudflare Pages と Pages Functions を使用した匿名 Misskey ノート投稿システム。IP ベースとグローバルのレートリミットを実装しています。

## 機能

- シンプルな投稿フォーム
- Misskey API を使用したノート投稿
- セキュアなトークン管理（フロントエンドに非露出）
- レートリミット実装
  - IP ベース: 1分間に10リクエスト
  - グローバル: 1分間に100リクエスト
- 投稿設定
  - 公開範囲: パブリック
  - ローカルのみ: 有効
  - リアクション制限: いいねのみ

## セットアップ

### 1. KV Namespace の作成

```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
```

### 2. wrangler.toml の設定

作成した KV Namespace の ID と URL/TOKEN を `wrangler.toml` に設定します：

```toml
kv_namespaces = [
  { binding = "RATE_LIMIT_KV", id = "ここに1で作成したKVのIDを入力" }
]

[vars]
MISSKEY_URL = "https://misskeyインスタンスのURL" #最後に/は付けないでください
MISSKEY_TOKEN = "アクセストークン"
```

### 3. デプロイ

```bash
wrangler pages deploy
```

## プロジェクト構造

```
.
├── public/
│   └── index.html          # フロントエンド
├── functions/
│   ├── api/
│   │   └── post.ts         # Misskey API エンドポイント
│   └── utils/
│       └── rateLimiter.ts  # レートリミット実装
└── wrangler.toml           # Cloudflare Pages 設定
```

## セキュリティ注意事項

- Misskey トークンは必ず `wrangler.toml` で環境変数として設定し、フロントエンドに露出させないでください
- 本番環境では適切なレートリミット値を設定してください
- CORS 設定を必要に応じて調整してください

## 貢献

Issue や Pull Request は歓迎します。大きな変更を加える場合は、まず Issue で変更内容を議論してください。