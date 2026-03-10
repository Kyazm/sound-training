import type {
	ChordQuality,
	NoteName,
	NoteWithOctave,
	VoicingType,
} from "../../types/music";
import { CHORD_FORMULAS } from "./chords";
import { NOTE_NAMES, transposeNote } from "./notes";

export const VOICING_DISPLAY_NAMES: Record<VoicingType, string> = {
	rootPosition: "Root Position",
	firstInversion: "1st Inversion",
	secondInversion: "2nd Inversion",
	thirdInversion: "3rd Inversion",
	shell: "Shell Voicing",
	drop2: "Drop 2",
};

// Generate notes for a specific voicing type
export function buildVoicing(
	root: NoteName,
	quality: ChordQuality,
	voicingType: VoicingType,
	baseOctave = 4,
): NoteWithOctave[] {
	const formula = CHORD_FORMULAS[quality] ?? [0, 4, 7];
	const notes = formula.map((s) => transposeNote(root, s));

	// Generate octave-assigned notes based on voicing type
	switch (voicingType) {
		case "rootPosition": {
			return assignOctaves(notes, root, baseOctave);
		}
		case "firstInversion": {
			// Move root up an octave
			const inverted = [...notes.slice(1), notes[0]];
			return assignOctaves(inverted, notes[1], baseOctave);
		}
		case "secondInversion": {
			if (notes.length < 3) return assignOctaves(notes, root, baseOctave);
			const inverted = [...notes.slice(2), ...notes.slice(0, 2)];
			return assignOctaves(inverted, notes[2], baseOctave);
		}
		case "thirdInversion": {
			if (notes.length < 4) return assignOctaves(notes, root, baseOctave);
			const inverted = [...notes.slice(3), ...notes.slice(0, 3)];
			return assignOctaves(inverted, notes[3], baseOctave);
		}
		case "shell": {
			// Root + 3rd + 7th (skip 5th)
			if (notes.length < 4) return assignOctaves(notes, root, baseOctave);
			const shell = [notes[0], notes[1], notes[3]]; // root, 3rd, 7th
			return assignOctaves(shell, root, baseOctave);
		}
		case "drop2": {
			// Take top 4 notes, drop 2nd from top down an octave
			if (notes.length < 4) return assignOctaves(notes, root, baseOctave);
			const top4 = notes.slice(0, 4);
			// Drop the 2nd voice (index 2 from bottom = index 1 from top in a 4-note chord) down an octave
			const drop2 = [top4[2], top4[0], top4[1], top4[3]];
			const result = assignOctaves(drop2, drop2[0], baseOctave);
			// The dropped note goes down an octave
			const droppedNote = drop2[0];
			result[0] = `${droppedNote}${baseOctave - 1}` as NoteWithOctave;
			return result;
		}
	}
}

function assignOctaves(
	notes: NoteName[],
	lowestNote: NoteName,
	baseOctave: number,
): NoteWithOctave[] {
	const lowestIdx = NOTE_NAMES.indexOf(lowestNote);
	let currentOctave = baseOctave;
	let prevIdx = lowestIdx;

	return notes.map((n, i) => {
		const idx = NOTE_NAMES.indexOf(n);
		if (i > 0 && idx <= prevIdx) {
			currentOctave++;
		}
		prevIdx = idx;
		return `${n}${currentOctave}` as NoteWithOctave;
	});
}
