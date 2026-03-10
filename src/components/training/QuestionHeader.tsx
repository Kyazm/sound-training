import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../ui/ProgressBar";

interface QuestionHeaderProps {
	category: string;
	level: number;
	questionIndex: number;
	totalQuestions: number;
	correctCount: number;
}

export function QuestionHeader({
	category,
	level,
	questionIndex,
	totalQuestions,
	correctCount,
}: QuestionHeaderProps) {
	const navigate = useNavigate();
	const progress =
		totalQuestions > 0 ? (questionIndex / totalQuestions) * 100 : 0;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={() => navigate("/")}
					className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-white"
				>
					← 戻る
				</button>
				<span className="text-sm font-medium text-white">
					{category} Lv.{level}
				</span>
				<span className="text-sm text-slate-400">&#9881;</span>
			</div>
			<div className="flex items-center justify-between text-sm text-slate-400">
				<span>
					問題 {questionIndex + 1} / {totalQuestions}
				</span>
				<span>正解: {correctCount}</span>
			</div>
			<ProgressBar value={progress} color="indigo" />
		</div>
	);
}
