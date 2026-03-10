import { useCallback, useMemo, useState } from "react";
import { AnswerGrid } from "../components/training/AnswerGrid";
import { Feedback } from "../components/training/Feedback";
import { TrainingLayout } from "../components/training/TrainingLayout";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { audioEngine } from "../lib/audio/AudioEngine";
import { CHORD_DISPLAY_NAMES } from "../lib/music/chords";
import { VOICING_DISPLAY_NAMES } from "../lib/music/voicings";
import type { VoicingQuestionData } from "../lib/training/questionGenerator";
import {
	type ChordPlayMode,
	useSettingsStore,
} from "../stores/settingsStore";

const CHORD_PLAY_MODE_LABELS: Record<ChordPlayMode, string> = {
	block: "ブロック",
	arpeggio: "アルペジオ",
};

export function Voicings() {
	const [step, setStep] = useState<1 | 2>(1);
	const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
	const { chordPlayMode, setChordPlayMode } = useSettingsStore();

	const s = useTrainingSession({
		category: "voicing",
		onNextExtra: () => {
			setStep(1);
			setSelectedQuality(null);
		},
	});

	const q = s.currentQuestion;
	const d = q?.audioData as VoicingQuestionData | undefined;
	const correctQuality = q?.correctAnswer?.split("|")[0] ?? "";
	const correctVoicing = q?.correctAnswer?.split("|")[1] ?? "";

	const playSound = useCallback(async () => {
		if (s.isPlaying) { s.stopPlayback(); return; }
		if (!d) return;
		await s.initAudio();
		s.setPlaying(true);
		s.setReplayed(true);
		audioEngine.playChord(d.notes, chordPlayMode);
		setTimeout(() => s.setPlaying(false), 1000);
	}, [s, d, chordPlayMode]);

	const playCorrect = useCallback(async () => {
		if (!d) return;
		await s.initAudio();
		audioEngine.playChord(d.notes, chordPlayMode);
	}, [s, d, chordPlayMode]);

	const handleQualitySelect = useCallback(
		(quality: string) => {
			if (step !== 1 || s.showFeedback) return;
			setSelectedQuality(quality);
			setStep(2);
		},
		[step, s.showFeedback],
	);

	const handleVoicingSelect = useCallback(
		(voicing: string) => {
			if (step !== 2 || s.showFeedback || !selectedQuality) return;
			s.submitAnswer(`${selectedQuality}|${voicing}`);
		},
		[step, s, selectedQuality],
	);

	const handleBackToStep1 = useCallback(() => {
		if (s.showFeedback) return;
		setStep(1);
		setSelectedQuality(null);
	}, [s.showFeedback]);

	useKeyboardShortcut(
		useMemo(() => {
			const shortcuts: Record<string, () => void> = {
				space: playSound,
				enter: () => { if (s.showFeedback) s.handleNext(); },
				escape: () => { if (step === 2 && !s.showFeedback) handleBackToStep1(); },
			};

			if (d && !s.showFeedback) {
				const choices = step === 1 ? d.qualityChoices : d.voicingChoices;
				const handler = step === 1 ? handleQualitySelect : handleVoicingSelect;
				choices.forEach((c, i) => { shortcuts[String(i + 1)] = () => handler(c); });
			}

			return shortcuts;
		}, [playSound, s.showFeedback, s.handleNext, d, step, handleQualitySelect, handleVoicingSelect, handleBackToStep1]),
	);

	return (
		<TrainingLayout
			category="コード & ボイシング"
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
				{(["block", "arpeggio"] as const).map((mode) => (
					<button
						key={mode}
						type="button"
						onClick={() => setChordPlayMode(mode)}
						className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							chordPlayMode === mode
								? "bg-indigo-600 text-white"
								: "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
						}`}
					>
						{CHORD_PLAY_MODE_LABELS[mode]}
					</button>
				))}
			</div>
			{step === 1 && d && (
				<>
					<p className="mb-2 text-center text-sm text-slate-400">Step 1: コードの種類は？</p>
					<AnswerGrid
						choices={d.qualityChoices}
						onSelect={handleQualitySelect}
						selectedAnswer={s.showFeedback ? correctQuality : null}
						correctAnswer={null}
						disabled={s.showFeedback}
						displayNames={CHORD_DISPLAY_NAMES}
					/>
				</>
			)}
			{step === 2 && d && (
				<>
					<div className="mb-2 flex items-center justify-center gap-3">
						<p className="text-sm text-slate-400">Step 2: ボイシングは？</p>
						{!s.showFeedback && (
							<button
								type="button"
								onClick={handleBackToStep1}
								className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-600 hover:text-white"
							>
								← 戻る (Esc)
							</button>
						)}
					</div>
					<p className="mb-3 text-center text-sm text-indigo-400">
						選択中: {CHORD_DISPLAY_NAMES[selectedQuality as keyof typeof CHORD_DISPLAY_NAMES] ?? selectedQuality}
					</p>
					<AnswerGrid
						choices={d.voicingChoices}
						onSelect={handleVoicingSelect}
						selectedAnswer={s.showFeedback ? correctVoicing : null}
						correctAnswer={s.showFeedback ? correctVoicing : null}
						disabled={s.showFeedback}
						displayNames={VOICING_DISPLAY_NAMES}
					/>
				</>
			)}
			{s.showFeedback && q && d && (
				<Feedback
					isCorrect={s.selectedAnswer === q.correctAnswer}
					correctAnswer={q.correctAnswer}
					correctAnswerDisplay={`${CHORD_DISPLAY_NAMES[correctQuality as keyof typeof CHORD_DISPLAY_NAMES] ?? correctQuality} / ${VOICING_DISPLAY_NAMES[correctVoicing as keyof typeof VOICING_DISPLAY_NAMES] ?? correctVoicing}`}
					detail={`${d.root} ${CHORD_DISPLAY_NAMES[d.quality]} - ${VOICING_DISPLAY_NAMES[d.voicingType]}\n[ ${d.notes.join(" - ")} ]`}
					onNext={s.handleNext}
					onPlayCorrect={playCorrect}
				/>
			)}
		</TrainingLayout>
	);
}
