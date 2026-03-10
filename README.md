# Sound Training

A web-based ear training app designed for jazz and neo-soul musicians, built on the Berklee method. Train your ears with intervals, chord progressions, scales, melodies, voicings, and functional harmony using real jazz standard data.

## Features

- **6 Training Categories** — Intervals, Chord Progressions, Scales, Melody Dictation, Chord & Voicings, Functional Harmony
- **Adaptive Difficulty** — Levels automatically adjust based on your performance
- **Real Jazz Standards** — 34 chord progression datasets and 15 MusicXML-parsed melodies from jazz standards
- **Spaced Repetition (SM-2)** — Intelligently schedules review of weak areas
- **Keyboard Shortcuts** — Full keyboard-driven workflow (Space, 1-9, Enter, etc.)
- **Per-Level Statistics** — Detailed accuracy tracking and wrong answer review
- **Role-Based Access** — Admin (all levels), Player (Lv.1-3), Guest (Lv.1-3, no stats)

## Training Categories

| Category | Levels | Description |
|----------|--------|-------------|
| Intervals | 1-5 | Simple to compound intervals (m2 ~ M13) |
| Chord Progressions | 1-8 | Diatonic to neo-soul progressions |
| Scales | 1-7 | Church modes to bebop scales |
| Melody | 1-6 | Melody dictation with real jazz standard excerpts (Lv.3+) |
| Voicings | 1-7 | Triads to tension/drop2 voicings |
| Functional Harmony | 1-5 | T/SD/D function identification over jazz standards |

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Build**: Vite 7
- **Routing**: React Router 7 (HashRouter)
- **State**: Zustand 5
- **Audio**: Tone.js 15 (PolySynth)
- **Backend**: Supabase (Auth + PostgreSQL)
- **Testing**: Vitest + React Testing Library
- **Linter**: Biome
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Setup

```bash
git clone https://github.com/Kyazm/sound-training.git
cd sound-training
pnpm install
```

Create a `.env` file:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Optionally, for AI-powered chord progression explanations (local dev only):

```
VITE_OPENAI_API_KEY=<your-openai-api-key>
```

### Supabase Setup

1. Create a Supabase project
2. Run the migration files in `supabase/migrations/` via the SQL Editor
3. Set admin role manually:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
   ```

### Development

```bash
pnpm dev
```

### Testing

```bash
pnpm test        # Run once
pnpm test:watch  # Watch mode
```

### Build & Deploy

```bash
pnpm build       # Build for production
pnpm deploy      # Deploy to GitHub Pages
```

## Project Structure

```
src/
├── routes/           # Page components (Intervals, Scales, etc.)
├── components/       # Shared UI components
│   ├── training/     # TrainingLayout, AnswerGrid, Feedback, etc.
│   ├── piano/        # PianoKeyboard (for Melody)
│   └── ui/           # Button, Card, ProgressBar
├── hooks/            # useTrainingSession, useKeyboardShortcut
├── stores/           # Zustand stores (auth, training, settings, user)
├── lib/
│   ├── audio/        # AudioEngine (Tone.js wrapper)
│   ├── music/        # Music theory (intervals, chords, scales, etc.)
│   └── training/     # Question generation, level management, SM-2
├── data/             # Jazz standard chord data & parsed melodies
└── types/            # TypeScript type definitions
```

## Security Notes

- Supabase Anon Key is a public key protected by Row Level Security (RLS)
- All tables enforce `auth.uid() = user_id` policies
- The `role` column on `profiles` is protected from client-side modification via RLS `WITH CHECK`
- OpenAI API key is excluded from production builds (`.env.production`)
- Guest users have no Supabase session; data is not persisted

## License

MIT
