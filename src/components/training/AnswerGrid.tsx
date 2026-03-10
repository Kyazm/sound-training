interface AnswerGridProps {
	choices: string[];
	onSelect: (answer: string) => void;
	selectedAnswer: string | null;
	correctAnswer: string | null;
	disabled: boolean;
	displayNames?: Record<string, string>;
}

function choiceStyle(
	choice: string,
	selected: string | null,
	correct: string | null,
): string {
	if (correct === null) {
		if (choice === selected) return "bg-indigo-600 ring-2 ring-indigo-400";
		return "bg-slate-700 hover:bg-slate-600";
	}

	if (choice === correct && choice === selected)
		return "bg-emerald-600 ring-2 ring-emerald-400";
	if (choice === selected) return "bg-red-600 ring-2 ring-red-400";
	if (choice === correct) return "bg-slate-700 ring-2 ring-emerald-400";
	return "bg-slate-700 opacity-50";
}

export function AnswerGrid({
	choices,
	onSelect,
	selectedAnswer,
	correctAnswer,
	disabled,
	displayNames,
}: AnswerGridProps) {
	const cols =
		choices.length <= 3
			? "grid-cols-3"
			: choices.length <= 6
				? "grid-cols-3"
				: "grid-cols-4";

	return (
		<div className={`grid gap-3 ${cols}`}>
			{choices.map((choice, i) => (
				<button
					key={choice}
					type="button"
					onClick={() => onSelect(choice)}
					disabled={disabled}
					className={`
						relative rounded-lg px-4 py-3 text-center font-medium text-white
						transition-colors duration-150
						${choiceStyle(choice, selectedAnswer, correctAnswer)}
						${disabled ? "cursor-not-allowed" : "cursor-pointer"}
					`}
				>
					<span className="absolute left-2 top-1 text-xs text-slate-400">
						{i + 1}
					</span>
					{displayNames?.[choice] ?? choice}
				</button>
			))}
		</div>
	);
}
