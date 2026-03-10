# Web技術調査 - 音感トレーニングアプリ

## 1. オーディオ技術

### Web Audio API

ブラウザネイティブのオーディオ処理API。

**基本機能:**
- `OscillatorNode`: サイン波、矩形波、のこぎり波、三角波の生成
- `GainNode`: ボリューム制御、フェードイン/アウト
- `BiquadFilterNode`: ハイパス、ローパス、バンドパスフィルター
- `ConvolverNode`: リバーブ（インパルスレスポンス）
- `AnalyserNode`: FFT、波形表示
- `AudioBufferSourceNode`: サンプル再生
- スケジューリング: `start(time)` で精密なタイミング制御

**コード・音程の生成:**
```
A4 = 440Hz
任意の音: freq = 440 * 2^((midiNote - 69) / 12)
和音: 複数のOscillatorNodeを同時に再生
```

### Tone.js

Web Audio APIのラッパーライブラリ。音楽アプリに最適。

**主な機能:**
- `Tone.Synth`: モノフォニックシンセサイザー（単音）
- `Tone.PolySynth`: 和音再生
- `Tone.Sampler`: サンプルベースの楽器（ピアノ音源等）
- `Tone.Transport`: テンポ、BPM管理
- `Tone.Sequence`, `Tone.Pattern`: パターン再生
- 豊富なエフェクト: Reverb, Delay, Chorus等
- 音楽的な記法: `"C4"`, `"Dm7"` 等

**利点:**
- ピアノロール的な記法でコードを鳴らせる
- テンポ同期したシーケンス再生
- 高品質なサンプラー（Salamander Piano等の無料音源あり）

### 音源の選択肢

| 方式 | メリット | デメリット |
|------|---------|----------|
| **オシレーター合成** | 軽量、即座に生成 | 音質がチープ |
| **FM合成** | 軽量、多様な音色 | リアルな楽器音は困難 |
| **サンプルベース** | リアルな音質 | 初回ロードが重い(数MB〜数十MB) |
| **SoundFont** | 多楽器対応 | ファイルサイズ大 |

**推奨**: Tone.Sampler + Salamander Grand Piano (無料、高品質)
初回ロード中はオシレーターでフォールバック

---

## 2. フレームワーク選定

### 候補比較

| フレームワーク | メリット | デメリット | 適性 |
|---------------|---------|----------|------|
| **Next.js (App Router)** | エコシステム充実、SSR/SSG、大コミュニティ | やや重い、Audio APIはクライアントのみ | ◎ |
| **SvelteKit** | 軽量、高速、直感的 | エコシステム小さめ | ○ |
| **Remix** | Web標準重視、フォーム処理 | オーディオ向け機能なし | △ |
| **Vite + React (SPA)** | シンプル、高速ビルド | SSR不要ならこれで十分 | ◎ |

### 推奨スタック

本アプリはSSR/SSG不要の純クライアントサイドアプリ（オーディオ処理、IndexedDB永続化）のため、SPAが最適。

```
フレームワーク: Vite + React 19 (SPA)
言語: TypeScript 5.x
スタイリング: Tailwind CSS 4
ルーティング: React Router 7 (or TanStack Router)
状態管理: Zustand (軽量、シンプル)
オーディオ: Tone.js
楽譜: VexFlow 5 or abcjs
MIDI: Web MIDI API (native)
テスト: Vitest + React Testing Library
デプロイ: GitHub Pages (無料)
Auth/DB: Supabase (無料枠: 50K MAU, 500MB DB)
```

---

## 3. UI/UXパターン

### 既存アプリから学ぶベストプラクティス

#### 練習画面の構成
```
┌─────────────────────────────────┐
│  [メニュー]   レベル: 3    XP: 450   │
├─────────────────────────────────┤
│                                 │
│     🔊 [再生ボタン]              │
│     (もう一度聞く)               │
│                                 │
│  ┌──────────────────────────┐  │
│  │  選択肢 / ピアノ鍵盤 /     │  │
│  │  コード記号ボタン           │  │
│  └──────────────────────────┘  │
│                                 │
│  正解率: 78%  連続正解: 5       │
│  [ヒント] [スキップ] [次へ]      │
└─────────────────────────────────┘
```

#### ゲーミフィケーション要素
- **XP / レベルシステム**: 正解でXP獲得、レベルアップ
- **ストリーク**: 連続正解でボーナス
- **デイリーチャレンジ**: 毎日のお題
- **アチーブメント**: 特定マイルストーン達成バッジ
- **プログレスバー**: 各カテゴリの進捗表示

#### アダプティブ難易度
- 正解率が80%以上 → 難易度UP
- 正解率が50%以下 → 難易度DOWN
- 間違えた問題を重点的に出題（間隔反復）

### 間隔反復学習（Spaced Repetition）

Anki式のSM-2アルゴリズムを音感トレーニングに適用:
- 正解した問題は出題間隔を伸ばす
- 間違えた問題はすぐに再出題
- **Ease Factor**: 簡単な問題ほど間隔が伸びる
- 各インターバル、各コードタイプ、各進行パターンごとに独立した間隔管理

---

## 4. MIDI対応

### Web MIDI API

```typescript
// MIDI入力の取得
const access = await navigator.requestMIDIAccess();
const input = access.inputs.values().next().value;
input.onmidimessage = (msg) => {
  const [status, note, velocity] = msg.data;
  // status 144 = Note On, 128 = Note Off
};
```

**活用場面:**
- MIDIキーボードで回答を入力
- メロディ聴音 → MIDIキーボードで再現
- コードを弾いて回答

**注意:** MIDIサポートはChrome/Edgeのみ完全対応。Safari/Firefoxは非対応または実験的。

---

## 5. 楽譜・コード記号表示

### VexFlow 5

最も機能的なWeb楽譜レンダリングライブラリ:
- 五線譜、音符、コードシンボル、タブ譜
- SVGまたはCanvas描画
- 動的な楽譜生成

### abcjs

ABC記法から楽譜をレンダリング:
- 軽量
- ABC記法は習得が簡単
- 再生機能内蔵

### 本アプリでの活用
- **インターバル表示**: 2音を五線譜上に表示
- **コード記号**: コードネーム（Cm7, G7alt等）の表示
- **メロディ聴音**: 正解を楽譜で表示

---

## 6. PWA / オフライン対応

### Service Worker
- オーディオサンプルをキャッシュ
- オフラインでも練習可能
- バックグラウンド同期でスコア更新

### データ永続化
- **IndexedDB**: 学習進捗、間隔反復データ
- **localStorage**: 設定、直近のセッション
- クラウド同期はオプション（将来拡張）

---

## 7. パフォーマンス考慮

### オーディオレイテンシー
- Web Audio APIの `AudioContext` は初回ユーザーインタラクション後に生成
- `audioContext.resume()` をクリックイベントで呼ぶ
- バッファサイズは128〜256が低レイテンシー

### サンプルロード
- Lazy loading: 使用するオクターブのサンプルのみロード
- Progressive loading: 最初はオシレーター → サンプルロード完了後に切り替え
- サンプルファイルはOgg Vorbis（Chrome/Firefox）+ AAC（Safari）のデュアル対応
