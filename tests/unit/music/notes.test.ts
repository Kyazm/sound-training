import { describe, expect, it } from "vitest";
import {
	NOTE_NAMES,
	midiToNote,
	noteIndex,
	noteToFrequency,
	noteToMidi,
	transposeNote,
} from "../../../src/lib/music/notes";

describe("NOTE_NAMES", () => {
	it("contains 12 notes", () => {
		expect(NOTE_NAMES).toHaveLength(12);
	});

	it("starts with C and ends with B", () => {
		expect(NOTE_NAMES[0]).toBe("C");
		expect(NOTE_NAMES[11]).toBe("B");
	});
});

describe("noteIndex", () => {
	it("returns 0 for C", () => {
		expect(noteIndex("C")).toBe(0);
	});

	it("returns correct index for sharps", () => {
		expect(noteIndex("C#")).toBe(1);
		expect(noteIndex("F#")).toBe(6);
	});

	it("returns 9 for A", () => {
		expect(noteIndex("A")).toBe(9);
	});

	it("throws for invalid note", () => {
		expect(() => noteIndex("X" as never)).toThrow();
	});
});

describe("transposeNote", () => {
	it("transposes C up by 4 semitones to E", () => {
		expect(transposeNote("C", 4)).toBe("E");
	});

	it("wraps around from B", () => {
		expect(transposeNote("B", 1)).toBe("C");
	});

	it("handles negative semitones", () => {
		expect(transposeNote("C", -1)).toBe("B");
	});

	it("transposes by full octave returns same note", () => {
		expect(transposeNote("G", 12)).toBe("G");
	});

	it("transposes A up 3 to C", () => {
		expect(transposeNote("A", 3)).toBe("C");
	});
});

describe("noteToMidi", () => {
	it("converts C4 to 60", () => {
		expect(noteToMidi("C4")).toBe(60);
	});

	it("converts A4 to 69", () => {
		expect(noteToMidi("A4")).toBe(69);
	});

	it("converts C-1 to 0", () => {
		expect(noteToMidi("C-1")).toBe(0);
	});

	it("converts G#3 to 56", () => {
		expect(noteToMidi("G#3")).toBe(56);
	});

	it("throws for invalid format", () => {
		expect(() => noteToMidi("Z9" as never)).toThrow();
	});
});

describe("midiToNote", () => {
	it("converts 60 to C4", () => {
		expect(midiToNote(60)).toBe("C4");
	});

	it("converts 69 to A4", () => {
		expect(midiToNote(69)).toBe("A4");
	});

	it("converts 0 to C-1", () => {
		expect(midiToNote(0)).toBe("C-1");
	});

	it("roundtrips with noteToMidi", () => {
		expect(midiToNote(noteToMidi("F#5"))).toBe("F#5");
	});

	it("throws for out of range", () => {
		expect(() => midiToNote(128)).toThrow();
		expect(() => midiToNote(-1)).toThrow();
	});
});

describe("noteToFrequency", () => {
	it("returns 440 for A4", () => {
		expect(noteToFrequency("A4")).toBeCloseTo(440, 2);
	});

	it("returns ~261.63 for C4 (middle C)", () => {
		expect(noteToFrequency("C4")).toBeCloseTo(261.63, 1);
	});

	it("doubles frequency per octave", () => {
		const a3 = noteToFrequency("A3");
		const a4 = noteToFrequency("A4");
		expect(a4 / a3).toBeCloseTo(2, 5);
	});
});
