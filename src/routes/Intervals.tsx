import { useCallback, useMemo } from "react";
import { AnswerGrid } from "../components/training/AnswerGrid";
import { Feedback } from "../components/training/Feedback";
import { TrainingLayout } from "../components/training/TrainingLayout";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { audioEngine } from "../lib/audio/AudioEngine";
import { INTERVAL_NAMES } from "../lib/music/intervals";
import type { IntervalQuestionData } from "../lib/training/questionGenerator";
import {
	type IntervalPlayMode,
	useSettingsStore,
} from "../stores/settingsStore";

const PLAY_MODE_LABELS: Record<IntervalPlayMode, string> = {
	melodic: "メロディック",
	harmonic: "ハーモニック",
};

export function Intervals() {
	const s = useTrainingSession({ category: "interval" });
	const { intervalPlayMode, setIntervalPlayMode } = useSettingsStore();

	const q = s.currentQuestion;
	const d = q?.audioData as IntervalQuestionData | undefined;

	const playSound = useCallback(async () => {
		if (s.isPlaying) { s.stopPlayback(); return; }
		if (!d) return;
		await s.initAudio();
		s.setPlaying(true);
		s.setReplayed(true);
		audioEngine.playInterval(d.root, d.target, intervalPlayMode);
		setTimeout(() => s.setPlaying(false), 800);
	}, [s, d, intervalPlayMode]);

	const playCorrect = useCallback(async () => {
		if (!d) return;
		await s.initAudio();
		audioEngine.playInterval(d.root, d.target, intervalPlayMode);
	}, [s, d, intervalPlayMode]);

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
			category="インターバル"
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
			<div className="mb-3 flex items-center justify-center gap-2">
				<span className="text-xs text-slate-500">再生モード</span>
				{(["melodic", "harmonic"] as const).map((mode) => (
					<button
						key={mode}
						type="button"
						onClick={() => setIntervalPlayMode(mode)}
						className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							intervalPlayMode === mode
								? "bg-indigo-600 text-white"
								: "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
						}`}
					>
						{PLAY_MODE_LABELS[mode]}
					</button>
				))}
			</div>
			<AnswerGrid
				choices={q?.choices ?? []}
				onSelect={s.handleSelect}
				selectedAnswer={s.selectedAnswer}
				correctAnswer={s.showFeedback ? (q?.correctAnswer ?? null) : null}
				disabled={s.showFeedback}
				displayNames={INTERVAL_NAMES}
			/>
			{s.showFeedback && q && d && (
				<Feedback
					isCorrect={s.selectedAnswer === q.correctAnswer}
					correctAnswer={q.correctAnswer}
					correctAnswerDisplay={
						INTERVAL_NAMES[q.correctAnswer as keyof typeof INTERVAL_NAMES]
					}
					detail={`${d.root} → ${d.target}`}
					onNext={s.handleNext}
					onPlayCorrect={playCorrect}
				/>
			)}
		</TrainingLayout>
	);
}
