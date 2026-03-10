# アーキテクチャ設計

## ディレクトリ構成

```
sound-training/
├── docs/                          # ドキュメント
├── public/                        # 静的アセット
├── chord-melody-dataset/          # MusicXML メロディデータセット（15曲）
├── scripts/
│   └── parse-musicxml.ts          # MusicXML → MelodyNote[] パーサースクリプト
├── src/
│   ├── data/
│   │   ├── jazzStandards.ts       # ジャズスタンダード34曲のコード進行データ (2179行)
│   │   └── standardMelodies.ts    # 15曲の実メロディデータ（MusicXMLからパース済み MelodyNote[]）
│   ├── main.tsx                   # エントリポイント
│   ├── App.tsx                    # ルートコンポーネント + Router
│   ├── routes/                    # ページコンポーネント
│   │   ├── Login.tsx              # ログイン/サインアップ
│   │   ├── Home.tsx               # ホーム画面
│   │   ├── Intervals.tsx          # インターバルトレーニング
│   │   ├── Progressions.tsx       # コード進行
│   │   ├── Scales.tsx             # スケール/モード
│   │   ├── Melody.tsx             # メロディ聴音
│   │   ├── Voicings.tsx           # コード & ボイシング（2ステップ回答UI）
│   │   ├── FunctionalHarmony.tsx  # 機能和声（ジャズスタンダードベース）
│   │   └── Stats.tsx              # 統計
│   ├── components/
│   │   ├── ui/                    # 汎用UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Modal.tsx
│   │   ├── auth/                  # 認証コンポーネント
│   │   │   ├── AuthGuard.tsx      # 認証ガード（ゲストアクセス許可、ロールベース制御）
│   │   │   ├── LoginForm.tsx      # ログインフォーム + 「ゲストとして試す」ボタン
│   │   │   └── SignUpForm.tsx
│   │   ├── training/              # トレーニング共通コンポーネント
│   │   │   ├── TrainingLayout.tsx  # 統一レイアウト（loading/complete/question状態管理）
│   │   │   ├── QuestionHeader.tsx
│   │   │   ├── PlayButton.tsx
│   │   │   ├── AnswerGrid.tsx
│   │   │   ├── Feedback.tsx
│   │   │   └── SessionSummary.tsx
│   │   ├── piano/
│   │   │   └── PianoKeyboard.tsx
│   │   └── stats/
│   │       ├── AccuracyChart.tsx
│   │       └── WeakAreasCard.tsx
│   ├── lib/
│   │   ├── supabase.ts            # Supabase クライアント初期化
│   │   ├── audio/                 # オーディオエンジン
│   │   │   ├── AudioEngine.ts
│   │   │   └── playback.ts
│   │   ├── music/                 # 音楽理論ロジック
│   │   │   ├── intervals.ts
│   │   │   ├── chords.ts
│   │   │   ├── progressions.ts
│   │   │   ├── scales.ts
│   │   │   ├── notes.ts
│   │   │   ├── voicings.ts
│   │   │   └── functionalHarmony.ts
│   │   └── training/              # トレーニングロジック
│   │       ├── questionGenerator.ts
│   │       ├── levelManager.ts
│   │       └── spacedRepetition.ts
│   ├── stores/                    # Zustand stores
│   │   ├── authStore.ts           # 認証状態 + ロール管理
│   │   ├── trainingStore.ts       # トレーニングセッション（MAX_LEVELS, DEFAULT_QUESTIONS_PER_SESSION エクスポート）
│   │   ├── settingsStore.ts       # 設定状態（adminLevelOverrides, levelOverrides, intervalPlayMode含む）
│   │   ├── userStore.ts           # ユーザープロフィール・進捗・統計（fetchLevelStats / fetchWrongAnswers）
│   │   └── audioStore.ts          # オーディオ状態
│   ├── hooks/
│   │   ├── useTrainingSession.ts  # 全トレーニング共通セッション管理フック
│   │   └── useKeyboardShortcut.ts
│   └── types/
│       ├── music.ts
│       ├── training.ts
│       └── database.ts            # Supabase テーブル型
├── tests/
│   ├── unit/
│   │   ├── music/
│   │   └── training/
│   └── integration/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── biome.json
└── package.json
```

---

## コアモジュール設計

### 0. Supabase クライアント

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 1. AudioEngine（オーディオエンジン）

```typescript
class AudioEngine {
  async init(): Promise<void>
  playNote(note: NoteWithOctave, duration?: number): void
  playInterval(root: NoteWithOctave, target: NoteWithOctave, mode: 'melodic' | 'harmonic'): void
  playChord(notes: NoteWithOctave[], mode: 'block' | 'arpeggio'): void
  playProgression(chords: NoteWithOctave[][]): void
  playProgressionWithBeats(chordData: { notes: NoteWithOctave[]; beats: number }[], bpm: number): number
  playScale(notes: NoteWithOctave[]): void
  playMelody(notes: NoteWithOctave[]): void
  playMelodyWithBeats(data: { note: NoteWithOctave; beats: number }[], bpm: number): number
  stop(): void  // synth を dispose + 再生成（スケジュール済みイベントを確実にキャンセル）
}
```

### 2. Music Theory（音楽理論モジュール）

```typescript
// intervals.ts
function getInterval(note1: NoteName, note2: NoteName): IntervalType
function transposeNote(note: NoteName, interval: IntervalType, direction: 'up' | 'down'): NoteName
function getIntervalNotes(root: NoteName, interval: IntervalType): [NoteName, NoteName]

// chords.ts
function getChordNotes(root: NoteName, quality: ChordQuality): NoteName[]
function identifyChord(notes: NoteName[]): ChordIdentification
function getChordInKey(key: Key, degree: ScaleDegree): ChordInfo

// progressions.ts
function getProgressionChords(key: Key, degrees: ScaleDegree[]): ChordInfo[]
function getRandomProgression(level: number): ProgressionQuestion

// scales.ts
function getScaleNotes(root: NoteName, mode: ScaleMode): NoteName[]
function identifyMode(notes: NoteName[]): ScaleMode
```

### 3. Training Engine（トレーニングエンジン）

```typescript
// questionGenerator.ts
// コード/スケール定義は music modules から import（重複排除済み）
// STANDARD_MELODIES を standardMelodies.ts から import（Lv.3+ メロディ問題で使用）
function generateQuestion(
  category: TrainingCategory,
  level: number,
  spacedRepetitionQueue: SpacedRepetitionItem[]
): Question

// levelManager.ts
function calculateNewLevel(currentLevel: number, recentResults: ExerciseRecord[]): number

// spacedRepetition.ts (SM-2)
function updateRepetitionItem(item: SpacedRepetitionItem, quality: number): SpacedRepetitionItem
function getDueItems(items: SpacedRepetitionItem[], date: Date): SpacedRepetitionItem[]
```

### 4. トレーニング共通アーキテクチャ

6つのトレーニング画面（Intervals, Scales, Progressions, Melody, Voicings, FunctionalHarmony）は、共通の `useTrainingSession` フックと `TrainingLayout` コンポーネントで構成される。

```typescript
// hooks/useTrainingSession.ts
// Store接続、セッション初期化/保存、回答処理、ナビゲーション、キーボードショートカットを一括管理
// ロールに応じた動作: guest→Supabase保存スキップ、admin→adminLevelOverride使用
interface TrainingSessionConfig {
  category: TrainingCategory;
  fixedRootOverride?: NoteName;
  onNextExtra?: () => void;  // 次の問題時の追加処理（状態リセット等）
}

function useTrainingSession(config: TrainingSessionConfig): {
  level, currentQuestion, questionIndex, totalQuestions,
  sessionResults, selectedAnswer, showFeedback, sessionComplete,
  isPlaying, correctCount, replayed,
  initAudio, setPlaying, setReplayed, stopPlayback,
  handleSelect, handleNext, handleRetry, handleHome,
  submitAnswer,     // Voicing等で直接回答を送信
  choiceShortcuts,  // キーボード番号キー → 選択肢マッピング
}

// components/training/TrainingLayout.tsx
// loading状態 / セッション完了 / 問題表示の3状態を統一ハンドリング
// 各ページはchildrenに問題固有のUI（AnswerGrid, Feedback等）を渡すだけ
```

各ルートページの役割は「音の再生方法」と「問題固有のUI」の定義のみに限定される。

#### リファクタリングパターン

- `audioData` は各コンポーネント上部で一度だけキャスト（`const d = q?.audioData as XxxQuestionData | undefined;`）
- 再生停止は `s.stopPlayback()` を使用（`audioEngine.stop()` + `setPlaying(false)` を一元化）
- `stopPlayback()` 内部では synth を `dispose()` + 再生成することで、Tone.js のスケジュール済みイベントを確実にキャンセル

### 5. SettingsStore

```typescript
type IntervalPlayMode = 'melodic' | 'harmonic' | 'random';

interface SettingsState {
  adminLevelOverrides: Record<string, number>; // カテゴリ別のadmin用レベル上書き
  levelOverrides: Record<string, number>;      // guest/player用レベル上書き (Lv.1-3)
  intervalPlayMode: IntervalPlayMode;          // インターバル再生モード
  setAdminLevelOverride: (category: string, level: number) => void;
  setLevelOverride: (category: string, level: number) => void;
  setIntervalPlayMode: (mode: IntervalPlayMode) => void;
}
```

- **Admin**: ホーム画面のカテゴリカードから全レベルを選択 → `adminLevelOverrides` に保存
- **Guest/Player**: Lv.1-3 を選択可能 → `levelOverrides` に保存
- **Interval Play Mode**: melodic/harmonic/random の切替 → `intervalPlayMode` に保存

---

## 状態管理（Zustand）

### AuthStore
```typescript
interface AuthState {
  user: User | null;
  role: UserRole; // 'admin' | 'player' | 'guest'
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsGuest: () => void; // ゲストログイン（user=null, role='guest'）
  initialize: () => Promise<void>; // セッション復元 + profilesからrole取得
}
```

**ロール判定**:
- `signIn` / `initialize` 時に `profiles` テーブルから `role` を取得
- `signInAsGuest()` は Supabase Auth を使わず `{ user: null, role: 'guest' }` をセット
- `signOut` 時は `role` を `'player'` にリセット

### TrainingStore

`MAX_LEVELS: Record<TrainingCategory, number>` をエクスポート。ホーム画面のレベルセレクタで各カテゴリの最大レベルを参照する。
`DEFAULT_QUESTIONS_PER_SESSION = 5`（1セッションあたりのデフォルト問題数）をエクスポート。
`generateQuestion` は GENERATORS マップ（カテゴリ → 生成関数）を使用（switch/case から リファクタリング済み）。

```typescript
const MAX_LEVELS = {
  interval: 5, scale: 7, progression: 8,
  melody: 6, voicing: 7, functionalHarmony: 5
};
```

```typescript
interface TrainingState {
  category: TrainingCategory | null;
  level: number;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  sessionResults: ExerciseRecord[];

  startSession: (category: TrainingCategory, level: number) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  endSession: () => void;
  playCurrentQuestion: () => void;
}
```

### UserStore

統計データはSupabaseの `exercise_records` テーブルから集計する。ローカルストレージは使用しない。
`fetchLevelStats()` でカテゴリ別・レベル別の正解数/回答数を取得し、`fetchWrongAnswers()` で間違えた問題一覧を取得する。
```typescript
interface UserState {
  profile: UserProfile | null;
  categoryProgress: Record<string, CategoryProgress>;
  levelStats: Record<string, Record<number, { correct: number; attempts: number }>>;
  wrongAnswers: Record<string, Array<{ correctAnswer: string; userAnswer: string; createdAt: string }>>;
  loading: boolean;

  fetchProfile: (userId: string) => Promise<void>;
  fetchCategoryProgress: (userId: string) => Promise<void>;
  fetchLevelStats: (userId: string) => Promise<void>;
  fetchWrongAnswers: (userId: string) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  updateCategoryProgress: (category: string, result: ExerciseRecord) => Promise<void>;
}
```

### AudioStore
```typescript
interface AudioState {
  isInitialized: boolean;
  isPlaying: boolean;
  volume: number;

  initialize: () => Promise<void>;
  setVolume: (volume: number) => void;
}
```

---

## データフロー

```
ユーザーアクション (ボタン/キーボード)
    │
    ▼
useTrainingSession (共通フック)
    ├─→ choiceShortcuts: キー入力 → handleSelect
    ├─→ handleSelect → TrainingStore.submitAnswer
    ├─→ handleNext → 次の問題 + onNextExtra (状態リセット)
    ├─→ handleRetry → セッション再開始
    └─→ handleHome → セッションリセット + ナビゲーション
         │
         ▼
TrainingStore.submitAnswer(answer)
    │
    ├─→ 正解判定 (music theory module)
    ├─→ ExerciseRecord 生成
    ├─→ SpacedRepetition 更新
    └─→ 次の問題生成 or セッション終了
         │
         ▼
useTrainingSession (セッション完了時の副作用)
    ├─→ role === 'guest' → Supabase保存スキップ
    ├─→ role === 'admin' → adminLevelOverrides使用 + Supabase保存
    └─→ role === 'player' → 通常動作
         ├─→ XP 計算・付与 (UserStore.addXP)
         ├─→ カテゴリ進捗更新 (UserStore.updateCategoryProgress)
         └─→ 練習記録保存 (UserStore.saveExerciseRecords)
              │
              ▼
TrainingLayout (状態に応じたUI切替)
    ├─→ loading → 読み込み中表示
    ├─→ sessionComplete → SessionSummary
    └─→ question → QuestionHeader + PlayButton + children
         │
         ▼
    Supabase 永続化 (非同期バッチ、guest以外)
```

### 認証フロー

```
アプリ起動
    │
    ▼
AuthStore.initialize()
    │
    ├─→ セッションあり → profiles.role取得 → ホーム画面
    └─→ セッションなし → ログイン画面
         │
         ├─→ ログイン/サインアップ
         │    │
         │    ▼
         │    Supabase Auth → セッション取得
         │    → profiles.role取得 → UserStore.fetchProfile() → ホーム画面
         │
         └─→ 「ゲストとして試す」
              │
              ▼
              signInAsGuest() → { user: null, role: 'guest' }
              → ホーム画面（Lv.1-3、統計閲覧不可、Supabase保存なし）
```

### ロール別アクセス制御

| 機能 | admin | player | guest |
|------|-------|--------|-------|
| トレーニング実行 | 全レベル選択可（adminLevelOverrides） | Lv.1-3選択可（levelOverrides） | Lv.1-3選択可（levelOverrides） |
| レベル選択UI（Home） | カテゴリ別セレクタ（全レベル） | カテゴリ別セレクタ（Lv.1-3） | カテゴリ別セレクタ（Lv.1-3） |
| 統計ページ | 閲覧可 | 閲覧可 | 閲覧不可（ホームにリダイレクト） |
| Supabaseデータ保存 | あり | あり | なし |
| AuthGuard通過 | user必須 | user必須 | user=null許可 |

---

## キーボードショートカット

| キー | アクション |
|------|-----------|
| `Space` | 再生 / 再生中に押すと停止 |
| `1-9` | 選択肢を番号で選択 |
| `Enter` | 次の問題（フィードバック表示中のみ） |
| `H` | ヒント表示（機能和声） |
| `Backspace` | 入力取消（メロディ） |
| `Esc` | Step1に戻る（ボイシング） |

---

## パフォーマンス戦略

1. **コンポーネントの遅延ロード**: 各トレーニング画面は `React.lazy` + `Suspense`
2. **Supabase バッチ書き込み**: セッション終了時にまとめて保存（個々の回答ごとにAPIを叩かない）
3. **メモ化**: 音楽理論計算結果のキャッシュ
4. **オーディオ**: PolySynth使用でサンプルロード不要、即座に再生可能
