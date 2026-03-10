# 実装計画

全トレーニング機能を初回リリースに含める。Phase分けは行わない。
リズムトレーニング・MIDI対応・PWAは将来拡張とする。

---

## Step 1: プロジェクトセットアップ
- [ ] Vite + React 19 + TypeScript + Tailwind CSS 4 + pnpm 初期化
- [ ] Biome（linter/formatter）設定
- [ ] Vitest + React Testing Library 設定
- [ ] ディレクトリ構成作成
- [ ] React Router 7 (HashRouter) 設定
- [ ] GitHub Pages デプロイ設定（gh-pages + GitHub Actions）

## Step 2: Supabase セットアップ
- [ ] Supabase プロジェクト作成
- [ ] テーブル作成（profiles, category_progress, exercise_records, spaced_repetition_items）
- [ ] Row Level Security (RLS) ポリシー設定
- [ ] Supabase クライアント初期化（`lib/supabase.ts`）
- [ ] 環境変数設定（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）

## Step 3: 認証機能
- [ ] AuthStore（Zustand）
- [ ] ログインフォーム / サインアップフォーム
- [ ] AuthGuard コンポーネント（未ログインリダイレクト）
- [ ] セッション復元（リロード時の自動ログイン）
- [ ] ログアウト機能

## Step 4: 音楽理論コアモジュール（TDD）
- [ ] `notes.ts` - 音名変換、MIDI番号変換、異名同音処理
- [ ] `intervals.ts` - インターバル計算・判定・全インターバル定義
- [ ] `chords.ts` - コード構成音生成・判定（トライアド〜アルタード）
- [ ] `progressions.ts` - コード進行データ・生成（ダイアトニック〜ネオソウル）
- [ ] `scales.ts` - スケール/モード定義（チャーチモード〜メロディックマイナー）

## Step 5: オーディオエンジン
- [ ] `AudioEngine.ts` - Tone.js PolySynth 初期化
- [ ] 単音再生 / インターバル再生（melodic/harmonic）
- [ ] コード再生（block/arpeggio）
- [ ] コード進行再生（テンポ同期）
- [ ] スケール再生

## Step 6: トレーニングエンジン
- [ ] `questionGenerator.ts` - 全カテゴリの問題生成ロジック
- [ ] `levelManager.ts` - アダプティブ難易度調整
- [ ] `spacedRepetition.ts` - SM-2アルゴリズム
- [ ] TrainingStore / UserStore / AudioStore（Zustand）

## Step 7: UI実装 - 共通コンポーネント
- [ ] 基本レイアウト（ヘッダー、ナビゲーション）
- [ ] PlayButton（再生ボタン）
- [ ] AnswerGrid（選択肢グリッド）
- [ ] Feedback（正解/不正解フィードバック）
- [ ] SessionSummary（セッション結果）
- [ ] PianoKeyboard（ピアノ鍵盤）

## Step 8: UI実装 - 各トレーニング画面
- [ ] ホーム画面（カテゴリ選択、進捗表示）
- [ ] インターバルトレーニング
- [ ] コード認識トレーニング
- [ ] コード進行トレーニング
- [ ] スケール/モード認識
- [ ] メロディ聴音
- [ ] 統計ダッシュボード

## Step 9: データ永続化
- [ ] Supabase へのプロフィール保存/読み込み
- [ ] 練習記録のバッチ保存
- [ ] 間隔反復データの同期
- [ ] カテゴリ別進捗の更新

## Step 10: 仕上げ
- [ ] レスポンシブデザイン調整
- [ ] ダークモード対応
- [ ] キーボードショートカット
- [ ] エラーハンドリング・ローディング状態
- [ ] GitHub Pages デプロイ確認

---

## 実装の順序の考え方

```
Step 1-3（基盤）→ Step 4-6（ロジック）→ Step 7-8（UI）→ Step 9-10（統合・仕上げ）
```

1. **基盤が先**: プロジェクト構成、認証、DB がないと何も始まらない
2. **ロジックをTDDで**: 音楽理論モジュールはUIなしで完全にテスト可能。ここを堅牢に作る
3. **オーディオは早期に**: 音が鳴らないとUI実装時に動作確認できない
4. **UIはロジック完成後**: 正しいロジックの上にUIを乗せる
5. **永続化は最後でOK**: 開発中はメモリ上で動作確認し、最後にSupabase連携

---

## 将来拡張

- リズムトレーニング
- MIDI入力対応（Web MIDI API）
- PWA / オフライン対応
- 楽譜表示（VexFlow）
- デイリーチャレンジ
