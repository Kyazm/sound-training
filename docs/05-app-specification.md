# アプリケーション仕様書

## プロダクト概要

**名称**: Sound Training（仮）
**概要**: バークリーメソッドに基づく、ジャズ・コンテンポラリー音楽特化の音感トレーニングWebアプリ
**ターゲット**: ジャズ・ネオソウルを学ぶミュージシャン（初級〜上級）
**差別化**: 既存アプリにないジャズ和声・テンションコード・コード進行の体系的トレーニング
**UI言語**: 日本語（音楽用語は英語表記: Maj7, ii-V-I 等）

---

## 機能要件

### F1: ユーザー認証・ロールベースアクセス制御
- ID（メールアドレス）+ パスワードによるサインアップ/ログイン
- Supabase Auth を使用
- ログイン状態の永続化（セッション管理）
- 未ログイン時はログイン画面にリダイレクト（ゲストアクセス可）
- **3つのユーザーロール**: `admin` / `player` / `guest`
  - **admin**: 全レベル選択可能（カテゴリ別にLv.1〜最大レベルを自由に選択、adminLevelOverrides経由）、全機能利用可
  - **player**: Lv.1-3 選択可能（levelOverrides経由）、アダプティブ難易度に基づくレベル進行
  - **guest**: Lv.1-3 選択可能（levelOverrides経由）、統計ページ閲覧不可（ホームにリダイレクト）、Supabaseへのデータ保存なし
- ログイン画面に「ゲストとして試す」ボタン
- ロールは `profiles` テーブルの `role` カラムで管理（デフォルト: `player`）

### F2: インターバルトレーニング
- 2音を再生し、インターバルを選択肢から回答
- **Play Mode**: melodic / harmonic / random の3モード切替（settingsStoreに保存）
- レベル1-5の段階的難易度
  - Lv.1: P1, m3, M3, P5, P8（5種類、初心者向け）
  - Lv.4-5: Compound Intervals（m9, M9, P11, m13, M13）
- 文脈付きインターバル（キー内でのディグリー認識）

### F4: コード進行トレーニング
- 2-8コードの進行を再生し、ディグリーで回答
- ダイアトニック → ジャズ基本 → 高度な和声 → ネオソウルの段階
- レベル1-8の段階的難易度
- スタンダード進行パターンの認識

### F5: スケール/モード認識
- スケールまたはメロディを再生し、モード名を回答
- チャーチモード → メロディックマイナーモード → ビバップスケール
- レベル1-7の段階的難易度
  - Lv.1: Ionian, Aeolian のみ（2種類、初心者向け）
  - Lv.7: Bebop Dominant, Bebop Major, Bebop Dorian [NEW]

### F6: メロディ聴音
- メロディを再生し、音をピアノ鍵盤で入力
- レベル1-6の段階的難易度
  - Lv.1-2: ランダム生成のダイアトニックメロディ（スタンダード参照なし）
  - Lv.3-6: **MusicXMLからパースした実メロディデータ（15曲）を使用**
    - データソース: `chord-melody-dataset/` → `scripts/parse-musicxml.ts` → `src/data/standardMelodies.ts`
    - MelodyNote[] 型（pitch + beats）で実際の音高・リズムを保持
    - 対象15曲: All Of Me, All The Things You Are, Blue Bossa, Beautiful Love, Body And Soul, How High The Moon, Joy Spring, Misty, Stella By Starlight, Take The A Train, Days Of Wine And Roses, There Will Never Be Another You, Black Orpheus, Moment's Notice, On Green Dolphin Street
    - 問題文に曲名・作曲者・セクション名を表示
    - 回答後に各コードの推奨スケールを解説表示

### F9: コード & ボイシング [統合]
- コードを再生し、2ステップで回答: (1) コード種類（Major, minor, Maj7等）→ (2) ボイシングタイプ（Root Position, Inversions, Shell, Drop 2）
- 旧「コード認識」トレーニングを統合し、レベル1-7の段階的難易度
  - Lv.1-2: トライアド + 基本ポジション
  - Lv.3-5: 7thコード + 転回形/シェル
  - Lv.6-7: テンション/アルタードコード + Drop 2

### F10: 機能和声 [ジャズスタンダードベース]
- **ジャズスタンダード34曲**のコード進行の抜粋を再生し、ハイライトされたコードの機能（T/SD/D）を回答
- 問題文に曲名・作曲者を表示、回答後に推奨スケールを解説
- レベル1-5の段階的難易度（レベルが上がるほど複雑なスタンダードから出題）
- データソース: `src/data/jazzStandards.ts`（34曲、難易度1-5、全セクションのコード進行）

### F7: 学習管理
- 間隔反復学習（SM-2アルゴリズム）による最適な復習タイミング
- アダプティブ難易度調整
- 学習統計ダッシュボード（正解率、苦手分野、学習時間）
- **統計データはSupabaseのみに保存**（localStorageは使用しない）
  - `userStore.ts` の `fetchLevelStats()` / `fetchWrongAnswers()` で `exercise_records` テーブルを集計
  - カテゴリ別・レベル別の正解数/回答数を追跡
  - 間違えた問題を記録
- 統計ページは **player / admin ロールのみ** アクセス可能（ゲストはホームにリダイレクト）
  - カテゴリ別の展開可能なセクション + レベルごとの内訳表示
  - 間違えた問題リスト + カテゴリごとの「復習する」ボタン
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
│  │                             │   │
│  │  [ ゲストとして試す ]         │   │
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
│  ┌─────────┐ ┌─────────┐           │
│  │メロディ  │ │ボイシング│           │
│  │ 聴音   │ │  認識   │           │
│  │ Lv.1   │ │ Lv.1   │           │
│  └─────────┘ └─────────┘           │
│  ┌─────────┐                       │
│  │機能和声  │                       │
│  │         │                       │
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

### S5: 統計ダッシュボード（player / admin ロールのみアクセス可能）
```
┌─────────────────────────────────────┐
│ ← 戻る         統計                 │
├─────────────────────────────────────┤
│  全体正解率: 72%                    │
│  総セッション: 45                    │
│                                     │
│  ▼ インターバル  正解率 80% (40/50) │
│    Lv.1  90% (18/20)               │
│    Lv.2  70% (14/20)               │
│    Lv.3  80% (8/10)                │
│    間違えた問題: M7, tritone ...    │
│    [復習する]                       │
│                                     │
│  ▶ コード進行  正解率 65% (26/40)   │
│  ▶ スケール  正解率 78% (...)       │
│  ...                                │
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
  role text not null default 'player', -- 'admin' | 'player' | 'guest'
  created_at timestamptz default now()
);

-- カテゴリ別進捗
create table category_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category text not null, -- 'interval','progression','scale','melody','voicing','functionalHarmony'
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
type UserRole = 'admin' | 'player' | 'guest';

interface UserProfile {
  id: string;
  displayName: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  settings: UserSettings;
  role: UserRole;
}

interface UserSettings {
  playbackSpeed: number; // 0.5 - 2.0
  fixedKey: string | null; // null = ランダム
  darkMode: boolean;
}

interface ExerciseRecord {
  id: string;
  userId: string;
  category: 'interval' | 'progression' | 'scale' | 'melody' | 'voicing' | 'functionalHarmony';
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
- [ ] インターバルトレーニング（レベル1-5、Compound Intervals含む）
- [ ] コード進行トレーニング（レベル1-8、Modal Interchange〜Multi-tonic）
- [ ] スケール/モード認識（レベル1-7、Bebop Scales含む）
- [ ] メロディ聴音（レベル1-6）
- [ ] コード & ボイシング（レベル1-7、コード認識統合）[統合]
- [ ] 機能和声（レベル1-5）[NEW]
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
