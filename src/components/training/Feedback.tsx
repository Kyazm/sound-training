import { Button } from "../ui/Button";

interface FeedbackProps {
	isCorrect: boolean;
	correctAnswer: string;
	correctAnswerDisplay?: string;
	detail?: string;
	onNext: () => void;
	onPlayCorrect?: () => void;
	children?: React.ReactNode;
}

export function Feedback({
	isCorrect,
	correctAnswer,
	correctAnswerDisplay,
	detail,
	onNext,
	onPlayCorrect,
	children,
}: FeedbackProps) {
	const display = correctAnswerDisplay ?? correctAnswer;

	return (
		<div className="flex flex-col items-center gap-4 rounded-xl bg-slate-800 p-6">
			{isCorrect ? (
				<p className="text-2xl font-bold text-emerald-400">
					&#10003; 正解！
				</p>
			) : (
				<>
					<p className="text-2xl font-bold text-red-400">
						&#10007; 不正解
					</p>
					<p className="text-slate-300">
						正解は{" "}
						<span className="font-semibold text-emerald-400">{display}</span>{" "}
						でした
					</p>
				</>
			)}
			{detail && (
				<p className="whitespace-pre-line text-center font-mono text-sm text-slate-400">{detail}</p>
			)}
			{children}
			{onPlayCorrect && (
				<button
					type="button"
					onClick={onPlayCorrect}
					className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
				>
					&#9654; 正解の音を聴く
				</button>
			)}
			<Button variant="primary" onClick={onNext}>
				次へ →
			</Button>
			<kbd className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-500">
				Enter
			</kbd>
		</div>
	);
}
