import type { Key, NoteName, ScaleMode } from "../../types/music";
import { transposeNote } from "./notes";

export const SCALE_FORMULAS: Record<ScaleMode, number[]> = {
	ionian: [0, 2, 4, 5, 7, 9, 11],
	dorian: [0, 2, 3, 5, 7, 9, 10],
	phrygian: [0, 1, 3, 5, 7, 8, 10],
	lydian: [0, 2, 4, 6, 7, 9, 11],
	mixolydian: [0, 2, 4, 5, 7, 9, 10],
	aeolian: [0, 2, 3, 5, 7, 8, 10],
	locrian: [0, 1, 3, 5, 6, 8, 10],
	melodicMinor: [0, 2, 3, 5, 7, 9, 11],
	harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
	lydianDominant: [0, 2, 4, 6, 7, 9, 10],
	altered: [0, 1, 3, 4, 6, 8, 10],
	wholeTone: [0, 2, 4, 6, 8, 10],
	diminishedHW: [0, 1, 3, 4, 6, 7, 9, 10],
	diminishedWH: [0, 2, 3, 5, 6, 8, 9, 11],
	blues: [0, 3, 5, 6, 7, 10],
	bebopDominant: [0, 2, 4, 5, 7, 9, 10, 11],
	bebopMajor: [0, 2, 4, 5, 7, 8, 9, 11],
	bebopDorian: [0, 2, 3, 4, 5, 7, 9, 10],
};

export const SCALE_DISPLAY_NAMES: Record<ScaleMode, string> = {
	ionian: "Ionian (Major)",
	dorian: "Dorian",
	phrygian: "Phrygian",
	lydian: "Lydian",
	mixolydian: "Mixolydian",
	aeolian: "Aeolian (Natural Minor)",
	locrian: "Locrian",
	melodicMinor: "Melodic Minor",
	harmonicMinor: "Harmonic Minor",
	lydianDominant: "Lydian Dominant",
	altered: "Altered",
	wholeTone: "Whole Tone",
	diminishedHW: "Diminished (H-W)",
	diminishedWH: "Diminished (W-H)",
	blues: "Blues",
	bebopDominant: "Bebop Dominant",
	bebopMajor: "Bebop Major",
	bebopDorian: "Bebop Dorian",
};

export function getScaleNotes(root: NoteName, mode: ScaleMode): NoteName[] {
	const formula = SCALE_FORMULAS[mode];
	return formula.map((semitones) => transposeNote(root, semitones));
}

export function getScaleDegreeNotes(key: Key): NoteName[] {
	const mode = key.mode === "major" ? "ionian" : "aeolian";
	return getScaleNotes(key.root, mode);
}
