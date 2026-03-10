import { useCallback, useMemo, useState } from "react";
import { AnswerGrid } from "../components/training/AnswerGrid";
import { Feedback } from "../components/training/Feedback";
import { TrainingLayout } from "../components/training/TrainingLayout";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { audioEngine } from "../lib/audio/AudioEngine";
import { chordNotesToOctave } from "../lib/music/chords";
import { FUNCTIONAL_DISPLAY_NAMES } from "../lib/music/functionalHarmony";
import type { FunctionalHarmonyQuestionData } from "../lib/training/questionGenerator";

export function FunctionalHarmony() {
	const [showHint, setShowHint] = useState(false);

	const s = useTrainingSession({
		category: "functionalHarmony",
		onNextExtra: () => setShowHint(false),
	});

	const q = s.currentQuestion;
	const d = q?.audioData as FunctionalHarmonyQuestionData | undefined;
	const revealed = showHint || s.showFeedback;

	const playSound = useCallback(async () => {
		if (s.isPlaying) { s.stopPlayback(); return; }
		if (!d) return;
		await s.initAudio();
		s.setPlaying(true);
		s.setReplayed(true);
		const chordData = d.chords.map((c) => ({
			notes: chordNotesToOctave(c.root, c.quality),
			beats: c.beats,
		}));
		const totalSeconds = audioEngine.playProgressionWithBeats(chordData, d.bpm);
		setTimeout(() => s.setPlaying(false), totalSeconds * 1000 + 200);
	}, [s, d]);

	const playCorrect = useCallback(async () => {
		if (!d) return;
		await s.initAudio();
		const target = d.chords[d.targetIndex];
		audioEngine.playChord(chordNotesToOctave(target.root, target.quality), "block");
	}, [s, d]);

	useKeyboardShortcut(
		useMemo(
			() => ({
				space: playSound,
				enter: () => { if (s.showFeedback) s.handleNext(); },
				h: () => { if (!s.showFeedback) setShowHint(true); },
				...s.choiceShortcuts,
			}),
			[playSound, s.showFeedback, s.handleNext, s.choiceShortcuts],
		),
	);

	return (
		<TrainingLayout
			category="機能和声"
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
				<div className="mb-3 space-y-2">
					<p className="text-xs text-slate-500">
						Key: {d.key} {d.mode} — 「{d.standardTitle}」({d.standardComposer})
						<span className="ml-2">♩= {d.bpm}</span>
					</p>
					<div className="flex flex-wrap items-center gap-1 text-sm">
						{d.chords.map((ch, i) => (
							<span
								key={`${ch.degree}-${String(i)}`}
								className={`rounded px-2 py-0.5 ${
									i === d.targetIndex
										? "bg-amber-600 font-bold text-white"
										: "bg-slate-700 text-slate-300"
								}`}
							>
								{i === d.targetIndex
									? (revealed ? `? (${ch.degree})` : "?")
									: (revealed ? ch.degree : `${i + 1}`)}
							</span>
						))}
						{!revealed && (
							<button
								type="button"
								onClick={() => setShowHint(true)}
								className="ml-2 rounded border border-slate-600 px-2 py-0.5 text-xs text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-200"
							>
								ヒント (H)
							</button>
						)}
					</div>
				</div>
			)}
			<AnswerGrid
				choices={q?.choices ?? []}
				onSelect={s.handleSelect}
				selectedAnswer={s.selectedAnswer}
				correctAnswer={s.showFeedback ? (q?.correctAnswer ?? null) : null}
				disabled={s.showFeedback}
				displayNames={FUNCTIONAL_DISPLAY_NAMES}
			/>
			{s.showFeedback && q && d && (() => {
				const target = d.chords[d.targetIndex];
				return (
					<Feedback
						isCorrect={s.selectedAnswer === q.correctAnswer}
						correctAnswer={q.correctAnswer}
						correctAnswerDisplay={
							FUNCTIONAL_DISPLAY_NAMES[
								q.correctAnswer as keyof typeof FUNCTIONAL_DISPLAY_NAMES
							]
						}
						detail={`${target.degree}: ${target.root}${target.quality}`}
						onNext={s.handleNext}
						onPlayCorrect={playCorrect}
					>
						{d.targetScales.length > 0 && (
							<p className="mt-1 text-xs text-slate-400">
								推奨スケール: {d.targetScales.join(", ")}
							</p>
						)}
					</Feedback>
				);
			})()}
		</TrainingLayout>
	);
}
