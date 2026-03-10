import { useCallback, useMemo, useRef } from "react";
import { AIChat } from "../components/training/AIChat";
import { AnswerGrid } from "../components/training/AnswerGrid";
import { Feedback } from "../components/training/Feedback";
import { TrainingLayout } from "../components/training/TrainingLayout";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { audioEngine } from "../lib/audio/AudioEngine";
import { chordNotesToOctave } from "../lib/music/chords";
import type { ProgressionQuestionData } from "../lib/training/questionGenerator";

export function Progressions() {
	const progBaseOctave = useRef(3 + Math.floor(Math.random() * 2));

	const s = useTrainingSession({
		category: "progression",
		onNextExtra: () => {
			progBaseOctave.current = 3 + Math.floor(Math.random() * 2);
		},
	});

	const buildChordArrays = useCallback((data: ProgressionQuestionData) => {
		const base = progBaseOctave.current;
		return data.chords.map((c) => chordNotesToOctave(c.root, c.quality, base));
	}, []);

	const q = s.currentQuestion;
	const d = q?.audioData as ProgressionQuestionData | undefined;

	const playSound = useCallback(async () => {
		if (s.isPlaying) { s.stopPlayback(); return; }
		if (!d) return;
		await s.initAudio();
		s.setPlaying(true);
		s.setReplayed(true);
		const chordArrays = buildChordArrays(d);
		audioEngine.playProgression(chordArrays);
		setTimeout(() => s.setPlaying(false), chordArrays.length * 600);
	}, [s, d, buildChordArrays]);

	const playCorrect = useCallback(async () => {
		if (!d) return;
		await s.initAudio();
		audioEngine.playProgression(buildChordArrays(d));
	}, [s, d, buildChordArrays]);

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
			category="コード進行"
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
			{d && (
				<p className="text-sm text-slate-500">
					Key: {d.key.root} {d.key.mode}
				</p>
			)}
			<AnswerGrid
				choices={q?.choices ?? []}
				onSelect={s.handleSelect}
				selectedAnswer={s.selectedAnswer}
				correctAnswer={s.showFeedback ? (q?.correctAnswer ?? null) : null}
				disabled={s.showFeedback}
			/>
			{s.showFeedback && q && d && (
				<Feedback
					isCorrect={s.selectedAnswer === q.correctAnswer}
					correctAnswer={q.correctAnswer}
					detail={d.degrees.join(" - ")}
					onNext={s.handleNext}
					onPlayCorrect={playCorrect}
				>
					<AIChat
						key={`${s.questionIndex}-${q.correctAnswer}`}
						context={{
							key: d.key.root,
							mode: d.key.mode,
							degrees: d.degrees,
							correctAnswer: q.correctAnswer,
							userAnswer: s.selectedAnswer ?? "",
							isCorrect: s.selectedAnswer === q.correctAnswer,
							level: s.level,
						}}
					/>
				</Feedback>
			)}
		</TrainingLayout>
	);
}
