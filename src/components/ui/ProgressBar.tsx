const COLOR_CLASSES = {
	indigo: "bg-indigo-500",
	emerald: "bg-emerald-500",
	amber: "bg-amber-500",
} as const;

interface ProgressBarProps {
	value: number;
	color?: keyof typeof COLOR_CLASSES;
}

export function ProgressBar({ value, color = "indigo" }: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div className="flex items-center gap-3">
			<div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
				<div
					className={`h-full rounded-full transition-all duration-500 ease-out ${COLOR_CLASSES[color]}`}
					style={{ width: `${clamped}%` }}
				/>
			</div>
			<span className="w-10 text-right text-xs text-slate-400">
				{Math.round(clamped)}%
			</span>
		</div>
	);
}
