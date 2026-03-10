import type { ReactNode } from "react";
import { PlayButton } from "./PlayButton";
import { QuestionHeader } from "./QuestionHeader";
import { SessionSummary } from "./SessionSummary";

interface TrainingLayoutProps {
	category: string;
	level: number;
	questionIndex: number;
	totalQuestions: number;
	correctCount: number;
	sessionComplete: boolean;
	hasQuestion: boolean;
	isPlaying: boolean;
	replayed: boolean;
	onPlay: () => void;
	onRetry: () => void;
	onHome: () => void;
	prompt?: string;
	maxWidth?: string;
	children: ReactNode;
}

export function TrainingLayout({
	category,
	level,
	questionIndex,
	totalQuestions,
	correctCount,
	sessionComplete,
	hasQuestion,
	isPlaying,
	replayed,
	onPlay,
	onRetry,
	onHome,
	prompt,
	maxWidth = "max-w-lg",
	children,
}: TrainingLayoutProps) {
	if (!hasQuestion && !sessionComplete) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-900">
				<p className="text-slate-400">読み込み中...</p>
			</div>
		);
	}

	if (sessionComplete) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
				<SessionSummary
					category={category}
					level={level}
					correctCount={correctCount}
					totalQuestions={totalQuestions}
					onRetry={onRetry}
					onHome={onHome}
				/>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-slate-900 px-4 py-6">
			<div className={`mx-auto w-full ${maxWidth}`}>
				<QuestionHeader
					category={category}
					level={level}
					questionIndex={questionIndex}
					totalQuestions={totalQuestions}
					correctCount={correctCount}
				/>
				<div className="mt-8 flex flex-col items-center gap-6">
					{prompt && <p className="text-lg text-slate-300">{prompt}</p>}
					<PlayButton
						onPlay={onPlay}
						isPlaying={isPlaying}
						disabled={false}
						replayed={replayed}
					/>
					{children}
				</div>
			</div>
		</div>
	);
}
