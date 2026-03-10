# アーキテクチャ設計

## ディレクトリ構成

```
sound-training/
├── docs/                          # ドキュメント
├── public/                        # 静的アセット
├── src/
│   ├── main.tsx                   # エントリポイント
│   ├── App.tsx                    # ルートコンポーネント + Router
│   ├── routes/                    # ページコンポーネント
│   │   ├── Login.tsx              # ログイン/サインアップ
│   │   ├── Home.tsx               # ホーム画面
│   │   ├── Intervals.tsx          # インターバルトレーニング
│   │   ├── Chords.tsx             # コード認識
│   │   ├── Progressions.tsx       # コード進行
│   │   ├── Scales.tsx             # スケール/モード
│   │   ├── Melody.tsx             # メロディ聴音
│   │   └── Stats.tsx              # 統計
│   ├── components/
│   │   ├── ui/                    # 汎用UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Modal.tsx
│   │   ├── auth/                  # 認証コンポーネント
│   │   │   ├── AuthGuard.tsx      # 認証ガード（未ログインリダイレクト）
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignUpForm.tsx
│   │   ├── training/              # トレーニング共通コンポーネント
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
│   │   │   └── notes.ts
│   │   └── training/              # トレーニングロジック
│   │       ├── questionGenerator.ts
│   │       ├── levelManager.ts
│   │       └── spacedRepetition.ts
│   ├── stores/                    # Zustand stores
│   │   ├── authStore.ts           # 認証状態
│   │   ├── trainingStore.ts       # トレーニングセッション
│   │   ├── userStore.ts           # ユーザープロフィール・進捗
│   │   └── audioStore.ts          # オーディオ状態
│   ├── hooks/
│   │   ├── useAuth.ts             # 認証フック
│   │   ├── useAudio.ts
│   │   ├── useTraining.ts
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
  playNote(note: NoteName, duration?: number): void
  playInterval(root: NoteName, interval: IntervalType, mode: 'melodic' | 'harmonic'): void
  playChord(notes: NoteName[], mode: 'block' | 'arpeggio'): void
  playProgression(chords: ChordVoicing[], bpm: number): void
  playScale(notes: NoteName[], ascending: boolean): void
  stop(): void
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

---

## 状態管理（Zustand）

### AuthStore
```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>; // セッション復元
}
```

### TrainingStore
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
```typescript
interface UserState {
  profile: UserProfile | null;
  categoryProgress: Record<string, CategoryProgress>;

  fetchProfile: () => Promise<void>;
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
TrainingStore.submitAnswer(answer)
    │
    ├─→ 正解判定 (music theory module)
    ├─→ ExerciseRecord 生成
    ├─→ SpacedRepetition 更新
    ├─→ XP 計算・付与 (UserStore)
    ├─→ レベル判定 (levelManager)
    └─→ 次の問題生成 or セッション終了
         │
         ▼
    UI 更新 (React re-render)
         │
         ▼
    Supabase 永続化 (非同期バッチ)
```

### 認証フロー

```
アプリ起動
    │
    ▼
AuthStore.initialize()
    │
    ├─→ セッションあり → ホーム画面
    └─→ セッションなし → ログイン画面
         │
         ▼
    ログイン/サインアップ
         │
         ▼
    Supabase Auth → セッション取得
         │
         ▼
    UserStore.fetchProfile() → ホーム画面
```

---

## キーボードショートカット

| キー | アクション |
|------|-----------|
| `Space` | 再生 / もう一度再生 |
| `1-9` | 選択肢を番号で選択 |
| `Enter` | 次の問題 / 回答確定 |
| `H` | ヒント表示 |
| `S` | スキップ |
| `Esc` | セッション終了確認 |

---

## パフォーマンス戦略

1. **コンポーネントの遅延ロード**: 各トレーニング画面は `React.lazy` + `Suspense`
2. **Supabase バッチ書き込み**: セッション終了時にまとめて保存（個々の回答ごとにAPIを叩かない）
3. **メモ化**: 音楽理論計算結果のキャッシュ
4. **オーディオ**: PolySynth使用でサンプルロード不要、即座に再生可能
