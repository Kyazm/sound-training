import { describe, expect, it } from "vitest";
import {
	INTERVAL_NAMES,
	INTERVAL_SEMITONES,
	getInterval,
	getIntervalBySemitones,
	getIntervalNotes,
} from "../../../src/lib/music/intervals";

describe("INTERVAL_SEMITONES", () => {
	it("P1 is 0 semitones", () => {
		expect(INTERVAL_SEMITONES.P1).toBe(0);
	});

	it("P5 is 7 semitones", () => {
		expect(INTERVAL_SEMITONES.P5).toBe(7);
	});

	it("P8 is 12 semitones", () => {
		expect(INTERVAL_SEMITONES.P8).toBe(12);
	});

	it("tritone is 6 semitones", () => {
		expect(INTERVAL_SEMITONES.tritone).toBe(6);
	});
});

describe("INTERVAL_NAMES", () => {
	it("has English display name for m2", () => {
		expect(INTERVAL_NAMES.m2).toBe("m2");
	});

	it("has English display name for P5", () => {
		expect(INTERVAL_NAMES.P5).toBe("P5");
	});
});

describe("getInterval", () => {
	it("C to E is M3", () => {
		expect(getInterval("C", "E")).toBe("M3");
	});

	it("C to G is P5", () => {
		expect(getInterval("C", "G")).toBe("P5");
	});

	it("C to C is P1", () => {
		expect(getInterval("C", "C")).toBe("P1");
	});

	it("E to C is m6 (ascending)", () => {
		expect(getInterval("E", "C")).toBe("m6");
	});

	it("C to F# is tritone", () => {
		expect(getInterval("C", "F#")).toBe("tritone");
	});

	it("D to F is m3", () => {
		expect(getInterval("D", "F")).toBe("m3");
	});
});

describe("getIntervalNotes", () => {
	it("returns [C, E] for C M3", () => {
		expect(getIntervalNotes("C", "M3")).toEqual(["C", "E"]);
	});

	it("returns [G, D] for G P5", () => {
		expect(getIntervalNotes("G", "P5")).toEqual(["G", "D"]);
	});

	it("returns [A, A] for A P1", () => {
		expect(getIntervalNotes("A", "P1")).toEqual(["A", "A"]);
	});
});

describe("getIntervalBySemitones", () => {
	it("0 semitones is P1", () => {
		expect(getIntervalBySemitones(0)).toBe("P1");
	});

	it("7 semitones is P5", () => {
		expect(getIntervalBySemitones(7)).toBe("P5");
	});

	it("handles negative semitones via wrapping", () => {
		expect(getIntervalBySemitones(-5)).toBe("P5");
	});
});
