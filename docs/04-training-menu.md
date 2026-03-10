# トレーニングメニュー設計

全5カテゴリを初回リリースに含める。リズムトレーニングは将来拡張。
特にコード認識（Chord）とコード進行（Progression）に力を入れる。

## メニュー構成概要

```
🎵 Sound Training
├── 1. Interval Training (インターバル)
│   ├── 1.1 Basic Intervals (基本インターバル)
│   ├── 1.2 Compound Intervals (複合インターバル)
│   └── 1.3 Contextual Intervals (文脈付きインターバル)
├── 2. Chord Recognition (コード認識)
│   ├── 2.1 Triads (3和音)
│   ├── 2.2 7th Chords (7thコード)
│   ├── 2.3 Extended Chords (テンションコード)
│   └── 2.4 Altered Chords (アルタードコード)
├── 3. Chord Progression (コード進行)
│   ├── 3.1 Diatonic Progressions (ダイアトニック)
│   ├── 3.2 Jazz Standards (ジャズスタンダード)
│   ├── 3.3 Advanced Harmony (高度な和声)
│   └── 3.4 Neo-Soul / Contemporary (ネオソウル)
├── 4. Scale & Mode (スケール・モード)
│   ├── 4.1 Church Modes (チャーチモード)
│   ├── 4.2 Jazz Scales (ジャズスケール)
│   └── 4.3 Mode Recognition (モード認識)
└── 5. Melodic Dictation (メロディ聴音)
    ├── 5.1 Diatonic Melodies
    └── 5.2 Chromatic / Jazz Melodies
```

---

## 1. Interval Training

### 1.1 Basic Intervals（レベル1-3）

**出題形式**: 2つの音が順に鳴る → インターバルを選択

| レベル | 出題範囲 | 方向 |
|--------|---------|------|
| 1 | P1, m3, M3, P5, P8 | 上行のみ |
| 2 | m2, M2, m3, M3, P4, P5, m6, M6, m7, M7, P8 | 上行のみ |
| 3 | 全インターバル（tritone含む） | 上行 + 下行 |

**追加オプション:**
- ハーモニック（同時に鳴る）/ メロディック（順に鳴る）切替
- 基準音の固定 or ランダム
- タイマーモード（制限時間付き）

### 1.2 Compound Intervals（レベル4）

9th, 11th, 13th 等のオクターブ超えインターバル。
テンションノートの聴き取りの基礎。

### 1.3 Contextual Intervals（レベル5 - バークリー式）

**出題形式**: キーが提示される → メロディが鳴る → 各音のスケールディグリーを特定

例: Key=C → 「E, G, B, D」が鳴る → 「3, 5, 7, 2」と回答

**バリエーション:**
- ダイアトニックのみ（自然な音階）
- クロマティック含む（#4, b7 等）
- モード指定（ドリアンの中で等）

---

## 2. Chord Recognition

### 2.1 Triads（レベル1-2）

| レベル | 出題範囲 | 出題形式 |
|--------|---------|---------|
| 1 | Major, minor | コードを聞いてタイプを選択 |
| 2 | Major, minor, dim, aug | コードを聞いてタイプを選択 |

**追加**: 転回形の識別（ルートポジション / 1st / 2nd inversion）

### 2.2 7th Chords（レベル3-4）

| レベル | 出題範囲 |
|--------|---------|
| 3 | Maj7, dom7, min7 |
| 4 | Maj7, dom7, min7, min7(b5), dim7, minMaj7, aug7 |

### 2.3 Extended Chords（レベル5-6）

| レベル | 出題範囲 |
|--------|---------|
| 5 | 9th系: Maj9, dom9, min9, dom7(b9), dom7(#9) |
| 6 | 11th/13th系: dom7(#11), min11, dom13, Maj7(#11) |

### 2.4 Altered Chords（レベル7）

- dom7alt (b9, #9, #11, b13 の組み合わせ)
- 自由なテンションの組み合わせを聴き取り

---

## 3. Chord Progression

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
| 6 | Rhythm Changes, Autumn Leaves型, Blue Bossa型 |

**出題形式バリエーション:**
- A) コード進行を聞いて、ディグリーを選択
- B) コード進行を聞いて、コードネームを入力
- C) 進行の中の1つのコードだけ隠して当てる（穴埋め）
- D) 「この進行は何の曲?」クイズ

### 3.3 Advanced Harmony（レベル7-8）

| レベル | 進行タイプ |
|--------|-----------|
| 7 | モーダルインターチェンジ, ディセプティブ解決, コルトレーンチェンジ入門 |
| 8 | クロマティックメディアント, マルチトニックシステム, 自由な転調 |

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
| 6 | Diminished (H-W, W-H), Bebop scales |

### 4.3 Mode Recognition in Context

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

### 5.2 Jazz Melodies（レベル4-6）

| レベル | 内容 |
|--------|------|
| 4 | クロマティックノート含む、ビバップ的 |
| 5 | コード進行に対するメロディ（ガイドトーンライン） |
| 6 | インプロビゼーション的フレーズ |

---

## 練習フロー

### 1セッションの流れ

```
1. カテゴリ選択
2. レベル確認（自動 or 手動選択）
3. ウォームアップ（3問）
4. メインセッション（10-20問）
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
