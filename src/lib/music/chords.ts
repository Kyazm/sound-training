import type {
	ChordInfo,
	ChordQuality,
	Key,
	NoteName,
	NoteWithOctave,
	ScaleDegree,
} from "../../types/music";
import { NOTE_NAMES, transposeNote } from "./notes";
import { getScaleNotes } from "./scales";

export const CHORD_FORMULAS: Record<ChordQuality, number[]> = {
	major: [0, 4, 7],
	minor: [0, 3, 7],
	dim: [0, 3, 6],
	aug: [0, 4, 8],
	maj7: [0, 4, 7, 11],
	dom7: [0, 4, 7, 10],
	min7: [0, 3, 7, 10],
	min7b5: [0, 3, 6, 10],
	dim7: [0, 3, 6, 9],
	minMaj7: [0, 3, 7, 11],
	aug7: [0, 4, 8, 10],
	maj9: [0, 4, 7, 11, 14],
	dom9: [0, 4, 7, 10, 14],
	min9: [0, 3, 7, 10, 14],
	dom7b9: [0, 4, 7, 10, 13],
	dom7sharp9: [0, 4, 7, 10, 15],
	dom7sharp11: [0, 4, 7, 10, 18],
	min11: [0, 3, 7, 10, 14, 17],
	dom13: [0, 4, 7, 10, 14, 21],
	maj7sharp11: [0, 4, 7, 11, 18],
};

export const CHORD_DISPLAY_NAMES: Record<ChordQuality, string> = {
	major: "Major",
	minor: "minor",
	dim: "dim",
	aug: "aug",
	maj7: "Maj7",
	dom7: "dom7",
	min7: "min7",
	min7b5: "min7(b5)",
	dim7: "dim7",
	minMaj7: "minMaj7",
	aug7: "aug7",
	maj9: "Maj9",
	dom9: "dom9",
	min9: "min9",
	dom7b9: "dom7(b9)",
	dom7sharp9: "dom7(#9)",
	dom7sharp11: "dom7(#11)",
	min11: "min11",
	dom13: "dom13",
	maj7sharp11: "Maj7(#11)",
};

export function chordNotesToOctave(
	root: string,
	quality: string,
	baseOctave = 4,
): NoteWithOctave[] {
	const rootNote = root as NoteName;
	const formula = CHORD_FORMULAS[quality as ChordQuality] ?? [0, 4, 7];
	return formula.map((semitones) => {
		const note = transposeNote(rootNote, semitones);
		const octave =
			NOTE_NAMES.indexOf(rootNote) + semitones >= 12
				? baseOctave + 1
				: baseOctave;
		return `${note}${octave}` as NoteWithOctave;
	});
}

export function getChordNotes(
	root: NoteName,
	quality: ChordQuality,
): NoteName[] {
	const formula = CHORD_FORMULAS[quality];
	return formula.map((semitones) => transposeNote(root, semitones));
}

const DEGREE_MAP: Record<
	ScaleDegree,
	{ scaleIndex: number; quality: ChordQuality; chromaticOffset?: number }
> = {
	I: { scaleIndex: 0, quality: "maj7" },
	ii: { scaleIndex: 1, quality: "min7" },
	iii: { scaleIndex: 2, quality: "min7" },
	IV: { scaleIndex: 3, quality: "maj7" },
	V: { scaleIndex: 4, quality: "dom7" },
	vi: { scaleIndex: 5, quality: "min7" },
	vii: { scaleIndex: 6, quality: "min7b5" },
	bII: { scaleIndex: 0, quality: "maj7", chromaticOffset: 1 },
	bIII: { scaleIndex: 0, quality: "maj7", chromaticOffset: 3 },
	bV: { scaleIndex: 0, quality: "dom7", chromaticOffset: 6 },
	bVI: { scaleIndex: 0, quality: "maj7", chromaticOffset: 8 },
	bVII: { scaleIndex: 0, quality: "dom7", chromaticOffset: 10 },
	II7: { scaleIndex: 0, quality: "dom7", chromaticOffset: 2 },
	III7: { scaleIndex: 0, quality: "dom7", chromaticOffset: 4 },
	VI7: { scaleIndex: 0, quality: "dom7", chromaticOffset: 9 },
	"#IVdim7": { scaleIndex: 0, quality: "dim7", chromaticOffset: 6 },
	iv: { scaleIndex: 0, quality: "min7", chromaticOffset: 5 },
	bVII7: { scaleIndex: 0, quality: "dom7", chromaticOffset: 10 },
	bIII7: { scaleIndex: 0, quality: "dom7", chromaticOffset: 3 },
	bVI7: { scaleIndex: 0, quality: "dom7", chromaticOffset: 8 },
	IV7: { scaleIndex: 0, quality: "dom7", chromaticOffset: 5 },
};

const MINOR_DEGREE_MAP: Partial<
	Record<ScaleDegree, { quality: ChordQuality; chromaticOffset: number }>
> = {
	I: { quality: "min7", chromaticOffset: 0 },
	ii: { quality: "min7b5", chromaticOffset: 2 },
	bIII: { quality: "maj7", chromaticOffset: 3 },
	IV: { quality: "min7", chromaticOffset: 5 },
	V: { quality: "dom7", chromaticOffset: 7 },
	bVI: { quality: "maj7", chromaticOffset: 8 },
	bVII: { quality: "dom7", chromaticOffset: 10 },
};

export function getChordInKey(key: Key, degree: ScaleDegree): ChordInfo {
	if (key.mode === "minor") {
		const minorInfo = MINOR_DEGREE_MAP[degree];
		if (minorInfo) {
			const root = transposeNote(key.root, minorInfo.chromaticOffset);
			return {
				root,
				quality: minorInfo.quality,
				notes: getChordNotes(root, minorInfo.quality),
				degree,
			};
		}
	}

	const degreeInfo = DEGREE_MAP[degree];
	if (!degreeInfo) {
		throw new Error(`Unknown degree: ${degree}`);
	}

	let root: NoteName;
	if (degreeInfo.chromaticOffset !== undefined) {
		root = transposeNote(key.root, degreeInfo.chromaticOffset);
	} else {
		const scaleNotes = getScaleNotes(
			key.root,
			key.mode === "major" ? "ionian" : "aeolian",
		);
		root = scaleNotes[degreeInfo.scaleIndex];
	}

	return {
		root,
		quality: degreeInfo.quality,
		notes: getChordNotes(root, degreeInfo.quality),
		degree,
	};
}
