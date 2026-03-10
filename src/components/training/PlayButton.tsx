interface PlayButtonProps {
	onPlay: () => void;
	isPlaying: boolean;
	disabled: boolean;
	replayed: boolean;
}

export function PlayButton({
	onPlay,
	isPlaying,
	disabled,
	replayed,
}: PlayButtonProps) {
	return (
		<div className="flex flex-col items-center gap-3">
			<button
				type="button"
				onClick={onPlay}
				disabled={disabled}
				className={`
					flex h-24 w-24 items-center justify-center rounded-full
					text-3xl text-white transition-all duration-200
					${disabled ? "cursor-not-allowed bg-slate-700 opacity-50" : "cursor-pointer bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700"}
					${isPlaying ? "animate-pulse ring-4 ring-indigo-400/50" : ""}
				`}
			>
				{isPlaying ? "■" : "▶"}
			</button>
			<span className="text-sm text-slate-400">
				{replayed ? "もう一度再生" : "再生"}
			</span>
			<kbd className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-500">
				Space
			</kbd>
		</div>
	);
}
