import { useCallback, useMemo, useState } from "react";
import { PianoKeyboard } from "../components/piano/PianoKeyboard";
import { Feedback } from "../components/training/Feedback";
import { TrainingLayout } from "../components/training/TrainingLayout";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { audioEngine } from "../lib/audio/AudioEngine";
import type { MelodyQuestionData } from "../lib/training/questionGenerator";
import type { NoteWithOctave } from "../types/music";

export function Melody() {
	const [userInput, setUserInput] = useState<NoteWithOctave[]>([]);

	const s = useTrainingSession({
		category: "melody",
		onNextExtra: () => setUserInput([]),
	});

	const q = s.currentQuestion;
	const d = q?.audioData as MelodyQuestionData | undefined;
	const expectedLength = d?.notesWithOctave.length ?? 0;

	const playMelodyAudio = useCallback((md: MelodyQuestionData) => {
		if (md.bpm && md.noteBeats) {
			const melodyData = md.notesWithOctave.map((note, i) => ({
				note,
				beats: md.noteBeats![i] ?? 1,
			}));
			return audioEngine.playMelodyWithBeats(melodyData, md.bpm);
		}
		audioEngine.playMelody(md.notesWithOctave);
		return md.notesWithOctave.length * (60 / 120);
	}, []);

	const playSound = useCallback(async () => {
		if (s.isPlaying) { s.stopPlayback(); return; }
		if (!d) return;
		await s.initAudio();
		s.setPlaying(true);
		s.setReplayed(true);
		const totalSeconds = playMelodyAudio(d);
		setTimeout(() => s.setPlaying(false), totalSeconds * 1000 + 200);
	}, [d, s, playMelodyAudio]);

	const playCorrect = useCallback(async () => {
		if (!d) return;
		await s.initAudio();
		playMelodyAudio(d);
	}, [d, s, playMelodyAudio]);

	const handleNoteClick = useCallback(
		(nwo: NoteWithOctave) => {
			if (s.showFeedback || !d) return;
			const next = [...userInput, nwo];
			setUserInput(next);
			s.initAudio().then(() => audioEngine.playNote(nwo, 0.3));
			if (next.length === expectedLength) {
				s.submitAnswer(next.join(","));
			}
		},
		[s, d, userInput, expectedLength],
	);

	const handleUndo = useCallback(() => {
		if (s.showFeedback) return;
		setUserInput((prev) => prev.slice(0, -1));
	}, [s.showFeedback]);

	useKeyboardShortcut(
		useMemo(
			() => ({
				space: playSound,
				enter: () => { if (s.showFeedback) s.handleNext(); },
				backspace: handleUndo,
			}),
			[playSound, s.showFeedback, s.handleNext, handleUndo],
		),
	);

	const isCorrect = s.showFeedback && q
		? userInput.join(",") === q.correctAnswer
		: false;

	return (
		<TrainingLayout
			category="メロディ"
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
			maxWidth="max-w-2xl"
			prompt={q?.prompt}
		>
			<div className="mb-1 text-sm text-slate-400">
				<p>
					Key: {d?.root ?? "C"}
					{d?.bpm && (
						<span className="ml-3 text-xs text-slate-500">♩= {d.bpm}</span>
					)}
				</p>
				{d?.standardRef && (
					<p className="text-xs text-slate-500">
						「{d.standardRef.title}」({d.standardRef.composer}) [{d.standardRef.sectionName}]
					</p>
				)}
			</div>

			<div className="flex items-center gap-2">
				<div className="flex min-h-[2.5rem] flex-wrap items-center gap-1 rounded-lg bg-slate-800 px-3 py-2">
					{expectedLength > 0 &&
						Array.from({ length: expectedLength }).map((_, i) => {
							const correct = d?.notesWithOctave[i];
							const entered = userInput[i];
							let style = "bg-slate-700 text-slate-500";
							if (entered) {
								if (s.showFeedback) {
									style = entered === correct
										? "bg-emerald-600 text-white"
										: "bg-red-600 text-white";
								} else {
									style = "bg-indigo-600 text-white";
								}
							}
							return (
								<span
									key={`slot-${
										// biome-ignore lint/suspicious/noArrayIndexKey: static slots
										i
									}`}
									className={`inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded px-1 text-xs font-mono ${style}`}
								>
									{entered ?? "?"}
								</span>
							);
						})}
				</div>
				{!s.showFeedback && userInput.length > 0 && (
					<button
						type="button"
						onClick={handleUndo}
						className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
					>
						戻す
					</button>
				)}
			</div>

			<PianoKeyboard
				onNoteClick={handleNoteClick}
				highlightNotes={d?.scaleNotes}
				activeNote={userInput.length > 0 ? userInput[userInput.length - 1] : null}
				disabled={s.showFeedback}
				startOctave={3}
				octaves={3}
			/>

			{s.showFeedback && q && d && (
				<Feedback
					isCorrect={isCorrect}
					correctAnswer={q.correctAnswer}
					correctAnswerDisplay={d.notesWithOctave.join(" - ")}
					detail={d.notesWithOctave.join(" - ")}
					onNext={s.handleNext}
					onPlayCorrect={playCorrect}
				>
					{d.standardRef && d.standardRef.chords.length > 0 && (
						<div className="mt-2 space-y-1 text-xs text-slate-400">
							<p className="font-semibold text-slate-300">コードとスケール:</p>
							{d.standardRef.chords.map((ch, i) => (
								<p key={`${ch.degree}-${String(i)}`}>
									{ch.degree} ({ch.root}{ch.quality}): {ch.scales.join(", ")}
								</p>
							))}
						</div>
					)}
				</Feedback>
			)}
		</TrainingLayout>
	);
}
