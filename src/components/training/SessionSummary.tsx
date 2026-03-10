import { Button } from "../ui/Button";

interface SessionSummaryProps {
	category: string;
	level: number;
	correctCount: number;
	totalQuestions: number;
	onRetry: () => void;
	onHome: () => void;
	levelChange?: { newLevel: number; reason: "up" | "down" | "none" };
}

function accuracyColor(pct: number): string {
	if (pct >= 80) return "text-emerald-400";
	if (pct >= 60) return "text-amber-400";
	return "text-red-400";
}

export function SessionSummary({
	category,
	level,
	correctCount,
	totalQuestions,
	onRetry,
	onHome,
	levelChange,
}: SessionSummaryProps) {
	const pct =
		totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
	const xp = correctCount * 10;

	return (
		<div className="flex flex-col items-center gap-6 rounded-xl bg-slate-800 p-8">
			<h2 className="text-2xl font-bold text-white">セッション完了！</h2>

			<p className="text-sm text-slate-400">
				{category} Lv.{level}
			</p>

			<p className={`text-6xl font-extrabold ${accuracyColor(pct)}`}>{pct}%</p>

			<p className="text-slate-300">
				正解: {correctCount} / {totalQuestions}
			</p>

			{levelChange && levelChange.reason !== "none" && (
				<p
					className={`text-lg font-semibold ${
						levelChange.reason === "up" ? "text-emerald-400" : "text-red-400"
					}`}
				>
					{levelChange.reason === "up"
						? `レベルアップ！ Lv.${levelChange.newLevel}`
						: `レベルダウン Lv.${levelChange.newLevel}`}
				</p>
			)}

			<p className="text-sm text-indigo-400">+{xp} XP</p>

			<div className="flex gap-4">
				<Button variant="secondary" onClick={onRetry}>
					もう一度
				</Button>
				<Button variant="primary" onClick={onHome}>
					ホームに戻る
				</Button>
			</div>
		</div>
	);
}
