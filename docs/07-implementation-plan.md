# 実装計画

全トレーニング機能を初回リリースに含める。Phase分けは行わない。
リズムトレーニング・MIDI対応・PWAは将来拡張とする。

---

## Step 1: プロジェクトセットアップ ✅
- [x] Vite + React 19 + TypeScript + Tailwind CSS 4 + pnpm 初期化
- [x] Biome（linter/formatter）設定
- [x] Vitest + React Testing Library 設定
- [x] ディレクトリ構成作成
- [x] React Router 7 (HashRouter) 設定
- [ ] GitHub Pages デプロイ設定（gh-pages + GitHub Actions）

## Step 2: Supabase セットアップ ✅
- [x] Supabase プロジェクト作成
- [x] テーブル作成（profiles, category_progress, exercise_records, spaced_repetition_items）
- [x] Row Level Security (RLS) ポリシー設定
- [x] Supabase クライアント初期化（`lib/supabase.ts`）
- [x] 環境変数設定（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）
- [x] マイグレーションファイル作成（supabase/migrations/）
- [x] サインアップ時のprofile自動作成トリガー
- [x] `profiles` テーブルに `role TEXT NOT NULL DEFAULT 'player'` カラム追加

## Step 3: 認証機能 ✅
- [x] AuthStore（Zustand） — `role` 状態 + `signInAsGuest()` 追加
- [x] ログインフォーム / サインアップフォーム — 「ゲストとして試す」ボタン追加
- [x] AuthGuard コンポーネント（ゲストアクセス許可: role === 'guest' で user=null でも通過）
- [x] セッション復元（リロード時の自動ログイン + profilesからrole取得）
- [x] ログアウト機能
- [x] ロールベースアクセス制御（admin/player/guest）

## Step 4: 音楽理論コアモジュール（TDD）✅
- [x] `notes.ts` - 音名変換、MIDI番号変換、異名同音処理（24テスト）
- [x] `intervals.ts` - インターバル計算・判定・全インターバル定義（18テスト）— Compound Intervals (m9, M9, P11, m13, M13) 追加済み
- [x] `chords.ts` - コード構成音生成・判定（トライアド〜アルタード）（17テスト）
- [x] `progressions.ts` - コード進行データ・生成（ダイアトニック〜ネオソウル）— Lv.7-8（Modal Interchange, Chromatic Mediant, Coltrane, Multi-tonic）追加済み、Lv.6にAutumn Leaves/Rhythm Changes拡充
- [x] `scales.ts` - スケール/モード定義（チャーチモード〜ビバップスケール）（14テスト）— Lv.7 Bebop Scales (bebopDominant, bebopMajor, bebopDorian) 追加済み

## Step 5: オーディオエンジン ✅
- [x] `AudioEngine.ts` - Tone.js PolySynth 初期化（16テスト）
- [x] 単音再生 / インターバル再生（melodic/harmonic）
- [x] コード再生（block/arpeggio）
- [x] コード進行再生（テンポ同期）
- [x] スケール再生

## Step 6: トレーニングエンジン ✅
- [x] `questionGenerator.ts` - 全カテゴリの問題生成ロジック（9テスト）— GENERATORS マップ方式にリファクタリング済み、voicing/functionalHarmony対応
- [x] `levelManager.ts` - アダプティブ難易度調整（7テスト）
- [x] `spacedRepetition.ts` - SM-2アルゴリズム（10テスト）
- [x] TrainingStore（11テスト、DEFAULT_QUESTIONS_PER_SESSION=5）/ UserStore（7テスト）/ AudioStore（4テスト）

## Step 7: UI実装 - 共通コンポーネント ✅
- [x] Button / Card / ProgressBar（汎用UI）
- [x] PlayButton（再生ボタン）
- [x] AnswerGrid（選択肢グリッド）
- [x] Feedback（正解/不正解フィードバック）
- [x] QuestionHeader
- [x] TrainingLayout（統一レイアウト: loading/complete/question状態管理）
- [x] SessionSummary（セッション結果）
- [x] useKeyboardShortcut フック
- [x] useTrainingSession フック（全トレーニング共通セッション管理）

## Step 8: UI実装 - 各トレーニング画面 ✅
- [x] ホーム画面（カテゴリ選択、進捗表示、全ロール向けレベルセレクタ）
- [x] インターバルトレーニング（~79行）— Play Mode (melodic/harmonic/random) 設定対応
- [x] コード進行トレーニング（~90行）— Lv.7-8 対応
- [x] スケール/モード認識（~115行）— Lv.7 Bebop Scales 対応
- [x] メロディ聴音（~130行）— Lv.6 対応
- [x] コード & ボイシング（2ステップUI: コード種類 → ボイシングタイプ、旧コード認識を統合、Lv.1-7）[統合]
- [x] 機能和声 [NEW]
- [x] 統計ダッシュボード（player / admin ロールのみアクセス可能、Supabase exercise_records ベース）
  - カテゴリ別展開可能セクション + レベルごとの内訳表示
  - 間違えた問題リスト + カテゴリごとの「復習する」ボタン

> **リファクタリング済み**: 各トレーニング画面は `useTrainingSession` + `TrainingLayout` を使用し、
> 画面固有のロジック（再生方法・UI）のみを定義する構成に統一。
> 旧 `useTraining.ts` は削除済み。
> `questionGenerator.ts` の重複定義（CHORD_FORMULAS/SCALE_FORMULAS）を排除し、music modules からの import に統一。
> `chordNotesToOctave` ユーティリティを `lib/music/chords.ts` に移動。
> `trainingStore.generateQuestion` は switch/case から GENERATORS マップにリファクタリング済み。
> TrainingCategory 型に `voicing` / `functionalHarmony` を追加。
> コード認識をボイシング認識に統合（2ステップ回答UI）、`Chords.tsx` 削除、`generateChordQuestion` 削除。

## Step 9: データ永続化 ✅
- [x] Supabase へのプロフィール保存/読み込み
- [x] 練習記録のバッチ保存
- [x] カテゴリ別進捗の更新
- [x] XP・ストリーク管理
- [x] ゲスト時はSupabase保存をスキップ
- [x] 統計データはSupabaseのみに保存（localStorageは使用しない）
  - `userStore.ts` に `fetchLevelStats()` / `fetchWrongAnswers()` を実装
  - `exercise_records` テーブルからカテゴリ別・レベル別の正解数/回答数を集計
  - 間違えた問題一覧を取得
  - ゲストは統計ページにアクセス不可（ホームにリダイレクト）

## Step 10: 仕上げ
- [x] ダークモード（デフォルトダーク）
- [x] キーボードショートカット（Space/Enter/1-9/Escape）
- [ ] レスポンシブデザイン調整（微調整）
- [ ] GitHub Pages デプロイ確認

---

## Step 11: ジャズスタンダードデータベース統合 ✅
- [x] `src/data/jazzStandards.ts` — 34曲のジャズスタンダードコード進行データ (2179行)
  - 難易度1: Fly Me To The Moon, Blue Bossa, Summertime, Autumn Leaves, Satin Doll, Song For My Father
  - 難易度2: All Of Me, Take The A Train, There Will Never Be Another You, Just Friends, Misty, Days Of Wine And Roses, On Green Dolphin Street, Girl From Ipanema, Black Orpheus, Corcovado
  - 難易度3: All The Things You Are, How High The Moon, Solar, Beautiful Love, My Funny Valentine, What Is This Thing Called Love, Softly As In A Morning Sunrise, Wave
  - 難易度4: Stella By Starlight, Body And Soul, Rhythm Changes, Cherokee, Confirmation
  - 難易度5: Giant Steps, Moment's Notice, 'Round Midnight, Donna Lee, Joy Spring
- [x] スケール推奨ヘルパー関数 (`getRecommendedScales`)
- [x] 移調ユーティリティ (`transposeStandard`)
- [x] 機能和声の問題生成をジャズスタンダードベースに改修
  - 曲名・作曲者をプロンプトに表示
  - コード進行の抜粋を再生し、ターゲットコードの機能を問う
  - 回答後に推奨スケールを表示
- [x] メロディの問題生成をLv.3以上で**実メロディデータ（MusicXML由来）**に改修
  - `chord-melody-dataset/` の MusicXML ファイルから `scripts/parse-musicxml.ts` でパース
  - `src/data/standardMelodies.ts` に MelodyNote[]（pitch + beats）として15曲分を格納
  - 対象曲: all-of-me, all-the-things-you-are, blue-bossa, beautiful-love, body-and-soul, how-high-the-moon, joy-spring, misty, stella-by-starlight, take-the-a-train, days-of-wine-and-roses, there-will-never-be-another-you, black-orpheus, moments-notice, on-green-dolphin-street
  - `questionGenerator.ts` で STANDARD_MELODIES を import し、Lv.3+ で実メロディを出題
  - 旧 `buildStandardMelody()` 関数（アルゴリズム生成）は削除
  - Lv.1-2 は引き続きランダム生成のダイアトニックメロディ
  - 曲名・作曲者・セクション名をプロンプトに表示
  - 回答後に各コードの推奨スケールを解説表示
- [x] TrainingStore: ジェネレーター返り値にカスタムpromptを追加
- [x] Feedback コンポーネント: children プロップ追加（スケール解説表示用）

---

## テスト統計

- **テストファイル**: 12
- **テスト数**: 145
- **全パス**: ✅

---

## テスト用アカウント

```
Email:    demo@example.com
Password: demo1234
```

---

## 将来拡張

- リズムトレーニング
- MIDI入力対応（Web MIDI API）
- PWA / オフライン対応
- 楽譜表示（VexFlow）
- デイリーチャレンジ
