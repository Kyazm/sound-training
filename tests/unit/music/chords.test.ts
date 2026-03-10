import { describe, expect, it } from "vitest";
import {
	CHORD_DISPLAY_NAMES,
	CHORD_FORMULAS,
	getChordInKey,
	getChordNotes,
} from "../../../src/lib/music/chords";

describe("CHORD_FORMULAS", () => {
	it("major triad is [0, 4, 7]", () => {
		expect(CHORD_FORMULAS.major).toEqual([0, 4, 7]);
	});

	it("min7 is [0, 3, 7, 10]", () => {
		expect(CHORD_FORMULAS.min7).toEqual([0, 3, 7, 10]);
	});

	it("dim7 is [0, 3, 6, 9]", () => {
		expect(CHORD_FORMULAS.dim7).toEqual([0, 3, 6, 9]);
	});
});

describe("CHORD_DISPLAY_NAMES", () => {
	it("major displays as 'Major'", () => {
		expect(CHORD_DISPLAY_NAMES.major).toBe("Major");
	});

	it("dom7 displays as 'dom7'", () => {
		expect(CHORD_DISPLAY_NAMES.dom7).toBe("dom7");
	});
});

describe("getChordNotes", () => {
	it("C major returns [C, E, G]", () => {
		expect(getChordNotes("C", "major")).toEqual(["C", "E", "G"]);
	});

	it("A minor returns [A, C, E]", () => {
		expect(getChordNotes("A", "minor")).toEqual(["A", "C", "E"]);
	});

	it("G dom7 returns [G, B, D, F]", () => {
		expect(getChordNotes("G", "dom7")).toEqual(["G", "B", "D", "F"]);
	});

	it("C maj7 returns [C, E, G, B]", () => {
		expect(getChordNotes("C", "maj7")).toEqual(["C", "E", "G", "B"]);
	});

	it("D min7 returns [D, F, A, C]", () => {
		expect(getChordNotes("D", "min7")).toEqual(["D", "F", "A", "C"]);
	});

	it("F# dim returns [F#, A, C]", () => {
		expect(getChordNotes("F#", "dim")).toEqual(["F#", "A", "C"]);
	});
});

describe("getChordInKey", () => {
	const cMajor = { root: "C" as const, mode: "major" as const };

	it("I in C major is CMaj7", () => {
		const chord = getChordInKey(cMajor, "I");
		expect(chord.root).toBe("C");
		expect(chord.quality).toBe("maj7");
		expect(chord.degree).toBe("I");
	});

	it("ii in C major is Dm7", () => {
		const chord = getChordInKey(cMajor, "ii");
		expect(chord.root).toBe("D");
		expect(chord.quality).toBe("min7");
	});

	it("V in C major is G7", () => {
		const chord = getChordInKey(cMajor, "V");
		expect(chord.root).toBe("G");
		expect(chord.quality).toBe("dom7");
	});

	it("bII in C major is DbMaj7 (tritone sub)", () => {
		const chord = getChordInKey(cMajor, "bII");
		expect(chord.root).toBe("C#");
		expect(chord.quality).toBe("maj7");
	});

	it("VI7 in C major is A7 (secondary dominant)", () => {
		const chord = getChordInKey(cMajor, "VI7");
		expect(chord.root).toBe("A");
		expect(chord.quality).toBe("dom7");
	});

	it("ii-V-I in G major", () => {
		const gMajor = { root: "G" as const, mode: "major" as const };
		const ii = getChordInKey(gMajor, "ii");
		const V = getChordInKey(gMajor, "V");
		const I = getChordInKey(gMajor, "I");
		expect(ii.root).toBe("A");
		expect(V.root).toBe("D");
		expect(I.root).toBe("G");
	});
});
