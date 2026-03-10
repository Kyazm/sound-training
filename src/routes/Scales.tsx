import { useCallback, useMemo, useRef } from "react";
import { AnswerGrid } from "../components/training/AnswerGrid";
import { Feedback } from "../components/training/Feedback";
import { TrainingLayout } from "../components/training/TrainingLayout";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { audioEngine } from "../lib/audio/AudioEngine";
import { NOTE_NAMES, transposeNote } from "../lib/music/notes";
import { SCALE_DISPLAY_NAMES } from "../lib/music/scales";
import type { ScaleQuestionData } from "../lib/training/questionGenerator";
import type { NoteWithOctave, ScaleMode } from "../types/music";

const RELATIVE_MAJOR_OFFSET: Partial<Record<ScaleMode, number>> = {
	ionian: 0, dorian: 10, phrygian: 8, lydian: 7,
	mixolydian: 5, aeolian: 3, locrian: 1,
};

export function Scales() {
	const scaleBaseOctave = useRef(3 + Math.floor(Math.random() * 3));

	const s = useTrainingSession({
		category: "scale",
		onNextExtra: () => {
			scaleBaseOctave.current = 3 + Math.floor(Math.random() * 3);
		},
	});

	const buildScaleNotes = useCallback((data: ScaleQuestionData) => {
		let prevIdx = NOTE_NAMES.indexOf(data.notes[0]);
		let octave = scaleBaseOctave.current;
		return data.notes.map((n, i) => {
			if (i > 0) {
				const curIdx = NOTE_NAMES.indexOf(n);
				if (curIdx < prevIdx) octave++;
				prevIdx = curIdx;
			}
			return `${n}${octave}` as NoteWithOctave;
		});
	}, []);

	const q = s.currentQuestion;
	const d = q?.audioData as ScaleQuestionData | undefined;

	const playSound = useCallback(async () => {
		if (s.isPlaying) { s.stopPlayback(); return; }
		if (!d) return;
		await s.initAudio();
		s.setPlaying(true);
		s.setReplayed(true);
		const notesWithOctave = buildScaleNotes(d);
		audioEngine.playScale(notesWithOctave);
		setTimeout(() => s.setPlaying(false), notesWithOctave.length * 250);
	}, [s, d, buildScaleNotes]);

	const playCorrect = useCallback(async () => {
		if (!d) return;
		await s.initAudio();
		audioEngine.playScale(buildScaleNotes(d));
	}, [s, d, buildScaleNotes]);

	useKeyboardShortcut(
		useMemo(
			() => ({
				space: playSound,
				enter: () => { if (s.showFeedback) s.handleNext(); },
				...s.choiceShortcuts,
			}),
			[playSound, s.showFeedback, s.handleNext, s.choiceShortcuts],
		),
	);

	return (
		<TrainingLayout
			category="スケール"
			level={s.level}
			questionIndex={s.questionIndex}
			totalQuestions={s.totalQuestions}
			correctCount={s.correctCount}
			sessionComplete={s.sessionComplete}
			hasQuestion={!!q}
			isPlaying={s.isPlaying}
			replayed={s.replayed}
			onPlay={playSound}
			onRetry={s.handleRetry}
			onHome={s.handleHome}
			prompt={q?.prompt}
		>
			<AnswerGrid
				choices={q?.choices ?? []}
				onSelect={s.handleSelect}
				selectedAnswer={s.selectedAnswer}
				correctAnswer={s.showFeedback ? (q?.correctAnswer ?? null) : null}
				disabled={s.showFeedback}
				displayNames={SCALE_DISPLAY_NAMES}
			/>
			{s.showFeedback && q && d && (() => {
				const displayName = SCALE_DISPLAY_NAMES[d.mode as keyof typeof SCALE_DISPLAY_NAMES] ?? d.mode;
				const offset = RELATIVE_MAJOR_OFFSET[d.mode];
				const majorKey = offset !== undefined ? transposeNote(d.root, offset) : null;
				const keyLabel = majorKey ? `Key: ${majorKey}` : `Root: ${d.root}`;
				return (
					<Feedback
						isCorrect={s.selectedAnswer === q.correctAnswer}
						correctAnswer={q.correctAnswer}
						correctAnswerDisplay={displayName}
						detail={`${keyLabel}  ${d.root} ${displayName}\n${d.notes.join(" - ")}`}
						onNext={s.handleNext}
						onPlayCorrect={playCorrect}
					/>
				);
			})()}
		</TrainingLayout>
	);
}
