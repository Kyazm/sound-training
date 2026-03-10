import type { IntervalType, NoteName } from "../../types/music";
import { noteIndex, transposeNote } from "./notes";

export const INTERVAL_SEMITONES: Record<IntervalType, number> = {
	P1: 0,
	m2: 1,
	M2: 2,
	m3: 3,
	M3: 4,
	P4: 5,
	tritone: 6,
	P5: 7,
	m6: 8,
	M6: 9,
	m7: 10,
	M7: 11,
	P8: 12,
	m9: 13,
	M9: 14,
	P11: 17,
	m13: 20,
	M13: 21,
};

export const INTERVAL_NAMES: Record<IntervalType, string> = {
	P1: "P1",
	m2: "m2",
	M2: "M2",
	m3: "m3",
	M3: "M3",
	P4: "P4",
	tritone: "Tritone",
	P5: "P5",
	m6: "m6",
	M6: "M6",
	m7: "m7",
	M7: "M7",
	P8: "P8",
	m9: "m9",
	M9: "M9",
	P11: "P11",
	m13: "m13",
	M13: "M13",
};

const SEMITONE_TO_INTERVAL: Record<number, IntervalType> = Object.fromEntries(
	Object.entries(INTERVAL_SEMITONES).map(([k, v]) => [v, k]),
) as Record<number, IntervalType>;

export function getIntervalBySemitones(semitones: number): IntervalType {
	// Try exact match first (handles compound intervals > 12)
	const exact = SEMITONE_TO_INTERVAL[semitones];
	if (exact) {
		return exact;
	}
	// Fall back to octave-normalized lookup
	const normalized = ((semitones % 12) + 12) % 12;
	const interval = SEMITONE_TO_INTERVAL[normalized];
	if (!interval) {
		throw new Error(`No interval for ${semitones} semitones`);
	}
	return interval;
}

export function getInterval(note1: NoteName, note2: NoteName): IntervalType {
	const idx1 = noteIndex(note1);
	const idx2 = noteIndex(note2);
	const semitones = (((idx2 - idx1) % 12) + 12) % 12;
	return getIntervalBySemitones(semitones);
}

export function getIntervalNotes(
	root: NoteName,
	interval: IntervalType,
): [NoteName, NoteName] {
	const semitones = INTERVAL_SEMITONES[interval];
	return [root, transposeNote(root, semitones)];
}
