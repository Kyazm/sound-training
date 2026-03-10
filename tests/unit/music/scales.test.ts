import { describe, expect, it } from "vitest";
import {
	SCALE_DISPLAY_NAMES,
	SCALE_FORMULAS,
	getScaleDegreeNotes,
	getScaleNotes,
} from "../../../src/lib/music/scales";

describe("SCALE_FORMULAS", () => {
	it("ionian has 7 notes", () => {
		expect(SCALE_FORMULAS.ionian).toHaveLength(7);
	});

	it("wholeTone has 6 notes", () => {
		expect(SCALE_FORMULAS.wholeTone).toHaveLength(6);
	});

	it("diminishedHW has 8 notes", () => {
		expect(SCALE_FORMULAS.diminishedHW).toHaveLength(8);
	});

	it("blues has 6 notes", () => {
		expect(SCALE_FORMULAS.blues).toHaveLength(6);
	});
});

describe("SCALE_DISPLAY_NAMES", () => {
	it("has display names for all modes", () => {
		const modes = Object.keys(SCALE_FORMULAS);
		for (const mode of modes) {
			expect(
				SCALE_DISPLAY_NAMES[mode as keyof typeof SCALE_DISPLAY_NAMES],
			).toBeDefined();
		}
	});
});

describe("getScaleNotes", () => {
	it("C ionian returns C D E F G A B", () => {
		expect(getScaleNotes("C", "ionian")).toEqual([
			"C",
			"D",
			"E",
			"F",
			"G",
			"A",
			"B",
		]);
	});

	it("D dorian returns D E F G A B C", () => {
		expect(getScaleNotes("D", "dorian")).toEqual([
			"D",
			"E",
			"F",
			"G",
			"A",
			"B",
			"C",
		]);
	});

	it("C blues returns C D# F F# G A#", () => {
		expect(getScaleNotes("C", "blues")).toEqual([
			"C",
			"D#",
			"F",
			"F#",
			"G",
			"A#",
		]);
	});

	it("G mixolydian returns G A B C D E F", () => {
		expect(getScaleNotes("G", "mixolydian")).toEqual([
			"G",
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
		]);
	});

	it("C wholeTone returns 6 notes with whole-step intervals", () => {
		const notes = getScaleNotes("C", "wholeTone");
		expect(notes).toEqual(["C", "D", "E", "F#", "G#", "A#"]);
	});

	it("A aeolian returns A B C D E F G", () => {
		expect(getScaleNotes("A", "aeolian")).toEqual([
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
		]);
	});
});

describe("getScaleDegreeNotes", () => {
	it("C major returns ionian scale", () => {
		const notes = getScaleDegreeNotes({ root: "C", mode: "major" });
		expect(notes).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
	});

	it("A minor returns aeolian scale", () => {
		const notes = getScaleDegreeNotes({ root: "A", mode: "minor" });
		expect(notes).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
	});

	it("G major returns G ionian", () => {
		const notes = getScaleDegreeNotes({ root: "G", mode: "major" });
		expect(notes).toEqual(["G", "A", "B", "C", "D", "E", "F#"]);
	});
});
