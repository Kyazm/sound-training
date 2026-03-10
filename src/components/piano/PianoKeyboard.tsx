import type { NoteName, NoteWithOctave } from "../../types/music";

const WHITE_NOTES: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_NOTE_POSITIONS: Record<string, number> = {
	"C#": 0, "D#": 1, "F#": 3, "G#": 4, "A#": 5,
};

interface PianoKeyboardProps {
	onNoteClick: (note: NoteWithOctave) => void;
	highlightNotes?: NoteName[];
	activeNote?: NoteWithOctave | null;
	disabled?: boolean;
	startOctave?: number;
	octaves?: number;
}

export function PianoKeyboard({
	onNoteClick,
	highlightNotes = [],
	activeNote = null,
	disabled = false,
	startOctave = 3,
	octaves = 3,
}: PianoKeyboardProps) {
	const whiteKeys: { note: NoteName; octave: number; nwo: NoteWithOctave }[] = [];
	const blackKeys: { note: NoteName; octave: number; nwo: NoteWithOctave; whiteIndex: number }[] = [];

	for (let oct = startOctave; oct < startOctave + octaves; oct++) {
		for (const wn of WHITE_NOTES) {
			whiteKeys.push({ note: wn, octave: oct, nwo: `${wn}${oct}` as NoteWithOctave });
		}
		for (const [bn, pos] of Object.entries(BLACK_NOTE_POSITIONS)) {
			blackKeys.push({
				note: bn as NoteName,
				octave: oct,
				nwo: `${bn}${oct}` as NoteWithOctave,
				whiteIndex: (oct - startOctave) * 7 + pos,
			});
		}
	}

	const totalWhite = whiteKeys.length;

	return (
		<div className="relative mx-auto w-full select-none overflow-x-auto">
			<div className="relative min-w-[500px]">
				<div className="flex gap-[1px]">
					{whiteKeys.map(({ note, nwo }) => {
						const isHighlight = highlightNotes.includes(note);
						const isActive = activeNote === nwo;
						return (
							<button
								key={nwo}
								type="button"
								disabled={disabled}
								onClick={() => onNoteClick(nwo)}
								className={`relative h-28 flex-1 rounded-b-md border border-slate-600 text-[10px] font-medium transition-colors
									${isActive ? "bg-indigo-500 text-white" : isHighlight ? "bg-emerald-200 text-slate-800" : "bg-white text-slate-500 hover:bg-slate-100"}
									${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:bg-slate-200"}
								`}
							>
								<span className="absolute bottom-1 left-1/2 -translate-x-1/2">
									{note}
								</span>
							</button>
						);
					})}
				</div>
				<div className="pointer-events-none absolute inset-x-0 top-0">
					{blackKeys.map(({ note, nwo, whiteIndex }) => {
						const isHighlight = highlightNotes.includes(note);
						const isActive = activeNote === nwo;
						const leftPercent = ((whiteIndex + 0.65) / totalWhite) * 100;
						return (
							<button
								key={nwo}
								type="button"
								disabled={disabled}
								onClick={() => onNoteClick(nwo)}
								style={{ left: `${leftPercent}%`, width: `${(0.7 / totalWhite) * 100}%` }}
								className={`pointer-events-auto absolute h-[4.5rem] rounded-b-md text-[9px] font-medium transition-colors
									${isActive ? "bg-indigo-600 text-white" : isHighlight ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}
									${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:bg-slate-600"}
								`}
							>
								<span className="absolute bottom-1 left-1/2 -translate-x-1/2">
									{note}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
