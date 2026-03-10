# トレーニングメニュー設計

全6カテゴリを初回リリースに含める。リズムトレーニングは将来拡張。
コード認識はボイシング認識に統合済み（2ステップ回答: コード種類 → ボイシングタイプ）。

## MAX_LEVELS 一覧

```
interval: 5, scale: 7, progression: 8, melody: 6, voicing: 7, functionalHarmony: 5
```

## メニュー構成概要

```
🎵 Sound Training
├── 1. Interval Training (インターバル) — 5レベル
│   ├── 1.1 Basic Intervals (基本インターバル)
│   ├── 1.2 Compound Intervals (複合インターバル)
│   └── 1.3 Contextual Intervals (文脈付きインターバル)
├── 2. Chord Progression (コード進行) — 8レベル
│   ├── 3.1 Diatonic Progressions (ダイアトニック)
│   ├── 3.2 Jazz Standards (ジャズスタンダード)
│   ├── 3.3 Advanced Harmony (高度な和声)
│   └── 3.4 Neo-Soul / Contemporary (ネオソウル)
├── 4. Scale & Mode (スケール・モード) — 7レベル
│   ├── 4.1 Church Modes (チャーチモード)
│   ├── 4.2 Jazz Scales (ジャズスケール)
│   ├── 4.3 Bebop Scales (ビバップスケール)
│   └── 4.4 Mode Recognition (モード認識)
├── 5. Melodic Dictation (メロディ聴音) — 6レベル
│   ├── 5.1 Diatonic Melodies
│   └── 5.2 Chromatic / Jazz Melodies
├── 5. Chord & Voicing (コード & ボイシング) — 7レベル [統合]
│   ├── 5.1 Triads + Root Position (Lv.1-2)
│   ├── 5.2 7th Chords + Inversions (Lv.3-4)
│   ├── 5.3 Extended Chords + Shell/Drop 2 (Lv.5-6)
│   └── 5.4 Altered Chords + 全ボイシング (Lv.7)
└── 6. Functional Harmony (機能和声) — 5レベル [NEW]
    ├── 7.1 T/SD/D 基本認識
    └── 7.2 高度な機能認識
```

---

## 1. Interval Training

### 1.1 Basic Intervals（レベル1-3）

**出題形式**: 2つの音が順に鳴る → インターバルを選択

| レベル | 出題範囲 | 方向 |
|--------|---------|------|
| 1 | P1, m3, M3, P5, P8（5種類、初心者向け） | 上行のみ |
| 2 | m2, M2, m3, M3, P4, P5, m6, M6, m7, M7, P8 | 上行のみ |
| 3 | 全13インターバル（tritone含む） | 上行 + 下行 |

**Play Mode（設定切替）:**
- **melodic**（メロディック: 順に鳴る）— デフォルト
- **harmonic**（ハーモニック: 同時に鳴る）
- **random**（ランダム: melodic/harmonic がランダム切替）
- settingsStore に保存

**追加オプション:**
- 基準音の固定 or ランダム
- タイマーモード（制限時間付き）

### 1.2 Compound Intervals（レベル4-5）

オクターブ超えインターバル（テンションノートの聴き取りの基礎）。
IntervalType に m9, M9, P11, m13, M13 を追加。

| レベル | 出題範囲 |
|--------|---------|
| 4 | 13 basic intervals + m9, M9（計15種類） |
| 5 | 全18インターバル（+ P11, m13, M13） |

### 1.3 Contextual Intervals（レベル5 - バークリー式）

**出題形式**: キーが提示される → メロディが鳴る → 各音のスケールディグリーを特定

例: Key=C → 「E, G, B, D」が鳴る → 「3, 5, 7, 2」と回答

**バリエーション:**
- ダイアトニックのみ（自然な音階）
- クロマティック含む（#4, b7 等）
- モード指定（ドリアンの中で等）

---

## 2. Chord Progression

### 3.1 Diatonic Progressions（レベル1-3）

**出題形式**: コード進行が鳴る → ローマ数字（ディグリー）で回答

| レベル | コード数 | 進行タイプ |
|--------|---------|-----------|
| 1 | 2-3コード | I-IV, I-V, IV-V-I |
| 2 | 4コード | I-vi-IV-V, I-IV-V-I, ii-V-I |
| 3 | 4-8コード | I-vi-ii-V, iii-vi-ii-V-I, 12bar blues基本形 |

### 3.2 Jazz Standard Progressions（レベル4-6）

| レベル | 進行タイプ |
|--------|-----------|
| 4 | ii-V-I (Major/Minor), ターンアラウンド, ジャズブルース |
| 5 | セカンダリードミナント, トライトーンサブ, バックドアii-V |
| 6 | Autumn Leaves型, Rhythm Changes型, Blue Bossa型 [拡充] |

**出題形式バリエーション:**
- A) コード進行を聞いて、ディグリーを選択
- B) コード進行を聞いて、コードネームを入力
- C) 進行の中の1つのコードだけ隠して当てる（穴埋め）
- D) 「この進行は何の曲?」クイズ

### 3.3 Advanced Harmony（レベル7-8） [実装済み]

| レベル | 進行タイプ |
|--------|-----------|
| 7 | モーダルインターチェンジ (I-iv-bVII-I 等), ディセプティブ解決 |
| 8 | クロマティックメディアント, コルトレーン的パターン, マルチトニックシステム |

Progression MAX_LEVELS: 6 → 8

### 3.4 Neo-Soul / Contemporary（レベル6-8）

- ネオソウル的 Maj9 → min9 の浮遊感
- ゴスペル的 IV → iv → I
- R&B的クリシェライン進行
- アンビエントハーモニー（クォータルハーモニー等）

---

## 4. Scale & Mode Recognition

### 4.1 Church Modes（レベル1-3）

**出題形式**: スケールが1オクターブ演奏される → モード名を選択

| レベル | 出題範囲 |
|--------|---------|
| 1 | Ionian, Aeolian (MajorとNatural Minor) |
| 2 | + Dorian, Mixolydian |
| 3 | 全7モード |

### 4.2 Jazz Scales（レベル4-6）

| レベル | 出題範囲 |
|--------|---------|
| 4 | Melodic Minor, Harmonic Minor, Blues Scale |
| 5 | Lydian Dominant, Altered Scale, Whole Tone |
| 6 | Diminished (H-W, W-H) |

### 4.3 Bebop Scales（レベル7）[NEW]

| スケール | 説明 |
|---------|------|
| Bebop Dominant | Mixolydian + M7 (passing tone) |
| Bebop Major | Ionian + #5 (passing tone) |
| Bebop Dorian | Dorian + M3 (passing tone) |

Scale MAX_LEVELS: 6 → 7

### 4.4 Mode Recognition in Context

メロディが鳴る → 何のモードで演奏されているか特定
（スケールの上行/下行だけでなく、メロディの中で聴く）

---

## 5. Melodic Dictation

### 5.1 Diatonic Melodies（レベル1-3）

| レベル | メロディ長 | 範囲 |
|--------|----------|------|
| 1 | 4音 | ダイアトニック、ステップワイズ中心 |
| 2 | 8音 | ダイアトニック、跳躍あり |
| 3 | 1-2小節 | リズム付き |

### 5.2 Jazz Melodies（レベル3-6）[実メロディデータ]

Lv.3以上では**MusicXMLからパースした実メロディデータ**（15曲）を使用。
アルゴリズム生成ではなく、実際のジャズスタンダードの旋律（pitch + beats）を出題する。
問題文に曲名・作曲者・セクション名を表示し、回答後に各コードの推奨スケールを解説。

**データパイプライン**: `chord-melody-dataset/` (MusicXML) → `scripts/parse-musicxml.ts` → `src/data/standardMelodies.ts` (MelodyNote[])

**対象15曲**: All Of Me, All The Things You Are, Blue Bossa, Beautiful Love, Body And Soul, How High The Moon, Joy Spring, Misty, Stella By Starlight, Take The A Train, Days Of Wine And Roses, There Will Never Be Another You, Black Orpheus, Moment's Notice, On Green Dolphin Street

| レベル | 内容 |
|--------|------|
| 3 | スタンダード (難易度1) の実メロディ抜粋、8音 |
| 4 | スタンダード (難易度1-3) の実メロディ抜粋、6音 |
| 5 | スタンダード (難易度1-3) の実メロディ抜粋、8音 |
| 6 | スタンダード (難易度1-5) の実メロディ抜粋、10音 |

Melody MAX_LEVELS: 5 → 6

---

## 5. Chord & Voicing (コード & ボイシング) [統合]

**出題形式**: コードを再生し、2ステップで回答
- **Step 1**: コードの種類（Major, minor, Maj7, dom7 等）を選択
- **Step 2**: ボイシングタイプ（Root Position, Inversion, Shell, Drop 2）を選択

コード認識とボイシング認識を統合し、1つのトレーニングで両方のスキルを鍛える。

| レベル | コード種類 | ボイシングタイプ |
|--------|-----------|----------------|
| 1 | Major, minor | Root Position |
| 2 | Major, minor, dim, aug | Root Position, 1st Inversion |
| 3 | + Maj7, dom7, min7 | + 2nd Inversion |
| 4 | Maj7, dom7, min7, min7(b5), dim7, minMaj7 | + 3rd Inversion |
| 5 | + aug7 | + Shell Voicing |
| 6 | + Maj9, dom9, min9 | + Drop 2 |
| 7 | + dom7(b9), dom7(#9), dom7(#11), min11, dom13, Maj7(#11) | 全ボイシング |

---

## 7. Functional Harmony (機能和声) [ジャズスタンダードベース]

**目的**: 実在のジャズスタンダードのコード進行を聴き、各コードの機能（T/SD/D）を判定するスキルを育成する

**設計思想**:
- **ジャズスタンダード34曲**のコード進行データ（`src/data/jazzStandards.ts`）を元に出題
- 問題文に必ず**曲名と作曲者**を表示
- 進行の中のターゲットコードを「?」でハイライトし、その機能を問う
- 回答後に**推奨スケール**を解説として表示

**出題フロー**:
1. レベルに応じた難易度のスタンダードからランダムに選曲
2. 4-8コードのエクセルプト（抜粋）を再生
3. 1つのコードが「?」表示 → T/SD/D を回答
4. フィードバック: ディグリー名 + 推奨スケール表示

| レベル | スタンダード難易度 | エクセルプト長 | 対象曲例 |
|--------|-------------------|---------------|---------|
| 1 | 難易度1 | 4コード | Fly Me To The Moon, Autumn Leaves, Satin Doll |
| 2 | 難易度1-2 | 4コード | All Of Me, Take The A Train, Misty |
| 3 | 難易度1-3 | 6コード | All The Things You Are, Solar, How High The Moon |
| 4 | 難易度1-4 | 8コード | Stella By Starlight, Confirmation, Rhythm Changes |
| 5 | 難易度1-5 | 8コード | Giant Steps, Donna Lee, 'Round Midnight |

---

## 練習フロー

### 1セッションの流れ

```
1. カテゴリ選択
2. レベル確認（自動 or 手動選択）
3. ウォームアップ（3問）
4. メインセッション（デフォルト5問、DEFAULT_QUESTIONS_PER_SESSION=5）
   - 正解 → XP獲得、次の問題
   - 不正解 → 正解を表示&再生、解説、間隔反復キューに追加
5. セッション結果サマリー
   - 正解率、所要時間、苦手な項目
   - レベルアップ判定
```

### アダプティブ難易度アルゴリズム

```
if (直近10問の正解率 >= 85%) → レベルUP
if (直近10問の正解率 <= 45%) → レベルDOWN
if (特定タイプの正解率 < 50%) → そのタイプを重点出題

間隔反復:
- 正解: 次回出題まで interval * ease_factor
- 不正解: interval = 1 (すぐ再出題)
- ease_factor: 正解回数に応じて 1.3〜2.5
```
