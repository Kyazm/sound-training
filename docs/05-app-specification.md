# アプリケーション仕様書

## プロダクト概要

**名称**: Sound Training（仮）
**概要**: バークリーメソッドに基づく、ジャズ・コンテンポラリー音楽特化の音感トレーニングWebアプリ
**ターゲット**: ジャズ・ネオソウルを学ぶミュージシャン（初級〜上級）
**差別化**: 既存アプリにないジャズ和声・テンションコード・コード進行の体系的トレーニング
**UI言語**: 日本語（音楽用語は英語表記: Maj7, ii-V-I 等）

---

## 機能要件

### F1: ユーザー認証
- ID（メールアドレス）+ パスワードによるサインアップ/ログイン
- Supabase Auth を使用
- ログイン状態の永続化（セッション管理）
- 未ログイン時はログイン画面にリダイレクト

### F2: インターバルトレーニング
- 2音を再生し、インターバルを選択肢から回答
- 上行/下行/ハーモニック(同時)の切り替え
- レベル1-5の段階的難易度
- 文脈付きインターバル（キー内でのディグリー認識）

### F3: コード認識トレーニング
- コードを再生し、コードタイプを回答
- トライアド → 7th → テンション → アルタードの段階
- レベル1-7の段階的難易度
- 転回形の識別（オプション）

### F4: コード進行トレーニング
- 2-8コードの進行を再生し、ディグリーで回答
- ダイアトニック → ジャズ基本 → 高度な和声 → ネオソウルの段階
- レベル1-8の段階的難易度
- スタンダード進行パターンの認識

### F5: スケール/モード認識
- スケールまたはメロディを再生し、モード名を回答
- チャーチモード → メロディックマイナーモード → その他
- レベル1-6の段階的難易度

### F6: メロディ聴音
- メロディを再生し、音をピアノ鍵盤で入力
- レベル1-6の段階的難易度

### F7: 学習管理
- 間隔反復学習（SM-2アルゴリズム）による最適な復習タイミング
- アダプティブ難易度調整
- 学習統計ダッシュボード（正解率、苦手分野、学習時間）
- XP/レベルシステム
- デイリーストリーク

### F8: 設定
- 再生速度
- キー固定 or ランダム
- ダークモード

---

## 非機能要件

| 項目 | 要件 |
|------|------|
| **レスポンシブ** | モバイル・タブレット・デスクトップ対応 |
| **パフォーマンス** | オーディオレイテンシー 50ms以下、初回ロード 3秒以下 |
| **ブラウザ** | Chrome, Safari, Firefox, Edge最新版 |
| **データ永続化** | Supabase (PostgreSQL) でクラウド保存 |
| **認証** | Supabase Auth（メール+パスワード） |

---

## 画面構成

### S0: ログイン/サインアップ画面
```
┌─────────────────────────────────────┐
│        🎵 Sound Training            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  メールアドレス              │   │
│  │  [                        ] │   │
│  │  パスワード                  │   │
│  │  [                        ] │   │
│  │                             │   │
│  │  [ ログイン ]               │   │
│  │  アカウントをお持ちでない方    │   │
│  │  [ 新規登録 ]               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### S1: ホーム画面
```
┌─────────────────────────────────────┐
│  🎵 Sound Training       [ログアウト]│
│  レベル 5 | XP 1,250 | 連続 7日     │
├─────────────────────────────────────┤
│                                     │
│  📊 今日の進捗                      │
│  ██████████░░░░░░░░░ 12/20          │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │インター  │ │ コード  │           │
│  │ バル    │ │  認識   │           │
│  │ Lv.3   │ │ Lv.5   │           │
│  └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐           │
│  │コード   │ │スケール  │           │
│  │ 進行   │ │ &モード │           │
│  │ Lv.4   │ │ Lv.2   │           │
│  └─────────┘ └─────────┘           │
│  ┌─────────┐                       │
│  │メロディ  │                       │
│  │ 聴音   │                       │
│  │ Lv.1   │                       │
│  └─────────┘                       │
│                                     │
│  [デイリーチャレンジ] [統計]         │
└─────────────────────────────────────┘
```

### S2: トレーニング画面（共通レイアウト）
```
┌─────────────────────────────────────┐
│ ← 戻る   インターバル Lv.3   ⚙️    │
├─────────────────────────────────────┤
│  問題 5 / 20          正解: 4/4     │
│                                     │
│           🔊                        │
│      [ もう一度再生 ]                │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ m3 │ │ M3 │ │ P4 │ │ P5 │      │
│  └────┘ └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ m6 │ │ M6 │ │ m7 │ │ M7 │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  [ヒント]            [スキップ]     │
└─────────────────────────────────────┘
```

### S3: 正解/不正解フィードバック
```
┌─────────────────────────────────────┐
│         ✓ 正解！                    │
│    (or)  ✗ 正解は M3 でした         │
│                                     │
│    🔊 [正解を聴く]                   │
│                                     │
│    M3 = 長3度（半音4つ）             │
│    参考曲: "When the Saints..."      │
│                                     │
│         [ 次へ → ]                  │
└─────────────────────────────────────┘
```

### S4: コード進行トレーニング画面
```
┌─────────────────────────────────────┐
│ ← 戻る   コード進行 Lv.4    ⚙️     │
├─────────────────────────────────────┤
│  キー: C メジャー                    │
│                                     │
│  🔊 [ 進行を再生 ]                  │
│                                     │
│  コードを当ててください:             │
│  | [??] | [??] | [??] | [??] |     │
│                                     │
│  選択肢:                            │
│  ┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐  │
│  │ I ││ii ││iii││IV ││ V ││vi │  │
│  └───┘└───┘└───┘└───┘└───┘└───┘  │
│  ┌───┐┌────┐┌────┐┌─────┐        │
│  │vii││bII ││bVII││VI7  │        │
│  └───┘└────┘└────┘└─────┘        │
│                                     │
│  [回答を確認]                       │
└─────────────────────────────────────┘
```

### S5: 統計ダッシュボード
```
┌─────────────────────────────────────┐
│ ← 戻る         統計                 │
├─────────────────────────────────────┤
│  全体正解率: 72%                    │
│  総セッション: 45                    │
│  総練習時間: 12時間30分              │
│                                     │
│  📈 週間推移（チャート）             │
│  ▁▂▃▅▆▇█                          │
│                                     │
│  苦手な分野:                        │
│  • トライトーン認識      (45%)       │
│  • min7(b5) vs dim7     (52%)       │
│  • トライトーンサブ      (48%)       │
│                                     │
│  得意な分野:                        │
│  • P5 認識              (98%)       │
│  • Major vs minor triad (95%)       │
│  • ii-V-I 進行          (90%)       │
└─────────────────────────────────────┘
```

---

## データモデル

### Supabase テーブル設計

```sql
-- ユーザープロフィール（auth.usersと1:1）
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  level integer default 1,
  total_xp integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_practice_date date,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

-- カテゴリ別進捗
create table category_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category text not null, -- 'interval','chord','progression','scale','melody'
  current_level integer default 1,
  total_correct integer default 0,
  total_attempts integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, category)
);

-- 練習記録
create table exercise_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category text not null,
  subcategory text,
  level integer,
  question jsonb,
  correct_answer text,
  user_answer text,
  is_correct boolean,
  response_time_ms integer,
  created_at timestamptz default now()
);

-- 間隔反復アイテム
create table spaced_repetition_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category text not null,
  item_key text not null, -- e.g. "interval:tritone"
  ease_factor real default 2.5,
  interval_days integer default 1,
  repetitions integer default 0,
  next_review_date date,
  last_review_date date,
  unique(user_id, item_key)
);
```

### TypeScript 型定義

```typescript
interface UserProfile {
  id: string;
  displayName: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  settings: UserSettings;
}

interface UserSettings {
  playbackSpeed: number; // 0.5 - 2.0
  fixedKey: string | null; // null = ランダム
  darkMode: boolean;
}

interface ExerciseRecord {
  id: string;
  userId: string;
  category: 'interval' | 'chord' | 'progression' | 'scale' | 'melody';
  subcategory: string;
  level: number;
  question: unknown;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  createdAt: string;
}

interface SpacedRepetitionItem {
  id: string;
  userId: string;
  category: string;
  itemKey: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate: string;
}

interface CategoryProgress {
  category: string;
  currentLevel: number;
  totalCorrect: number;
  totalAttempts: number;
}
```

---

## オーディオエンジン仕様

### 音の生成

```
音域: C2 (MIDI 36) 〜 C7 (MIDI 96)
デフォルト基準音域: C3-C5
チューニング: A4 = 440Hz

コード再生:
- アルペジオ: 各音を120ms間隔で順に再生
- ブロック: 全音同時再生
- 長さ: 1.5秒（コード）、0.8秒（各音 in メロディ）

進行再生:
- テンポ: 80-120 BPM（設定可能）
- 各コード: 1小節（4拍）
- メトロノーム: オプション
```

### 音色

```
Piano: Tone.js PolySynth（ピアノ風シンセ）
音質にこだわらずシンプルに。サンプルロード不要で軽量。
```

---

## 技術スタック

```
Runtime:        Node.js 22+
Framework:      Vite + React 19 (SPA)
Language:       TypeScript 5.7+
Styling:        Tailwind CSS 4
Routing:        React Router 7 (hash router for GitHub Pages)
State:          Zustand
Auth/DB:        Supabase (Auth + PostgreSQL)
Audio:          Tone.js + Web Audio API
Testing:        Vitest + React Testing Library
Linter:         Biome
Package Mgr:    pnpm
Deploy:         GitHub Pages
```

### GitHub Pages デプロイ

- `HashRouter` を使用（GitHub Pagesはサーバーサイドルーティング非対応）
- `gh-pages` パッケージで自動デプロイ
- GitHub Actions でCI/CDパイプライン構築

### Supabase（無料枠）

- Auth: 50K MAU
- Database: 500MB PostgreSQL
- API: 無制限リクエスト
- 料金: $0

---

## 実装スコープ（全機能を初回リリースに含む）

### コア機能
- [ ] プロジェクトセットアップ
- [ ] Supabase認証（サインアップ/ログイン/ログアウト）
- [ ] オーディオエンジン（Tone.js PolySynth）
- [ ] インターバルトレーニング（レベル1-5）
- [ ] コード認識トレーニング（レベル1-7）
- [ ] コード進行トレーニング（レベル1-8）
- [ ] スケール/モード認識（レベル1-6）
- [ ] メロディ聴音（レベル1-6）
- [ ] 間隔反復学習（SM-2）
- [ ] アダプティブ難易度
- [ ] 学習統計ダッシュボード
- [ ] ホーム画面（進捗表示）
- [ ] レスポンシブデザイン（日本語UI）
- [ ] GitHub Pages デプロイ

### 将来拡張
- リズムトレーニング
- MIDI入力対応
- PWA/オフライン対応
- 楽譜表示（VexFlow）
