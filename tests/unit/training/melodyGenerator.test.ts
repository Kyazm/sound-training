import { describe, expect, it } from "vitest";
import { NOTE_NAMES } from "../../../src/lib/music/notes";
import { generateMelodyQuestion } from "../../../src/lib/training/questionGenerator";

describe("generateMelodyQuestion", () => {
	it("level 1 generates 4 diatonic notes", () => {
		const q = generateMelodyQuestion(1);
		expect(q.data.notes).toHaveLength(4);
		expect(q.correctAnswer).toBe(q.data.notesWithOctave.join(","));
	});

	it("level 2 generates 6 notes", () => {
		const q = generateMelodyQuestion(2);
		expect(q.data.notes).toHaveLength(6);
	});

	it("level 3 generates 8 notes", () => {
		const q = generateMelodyQuestion(3);
		expect(q.data.notes).toHaveLength(8);
	});

	it("all notes are valid NoteNames", () => {
		for (let level = 1; level <= 5; level++) {
			const q = generateMelodyQuestion(level);
			for (const note of q.data.notes) {
				expect(NOTE_NAMES).toContain(note);
			}
		}
	});

	it("defaults to C when no fixedRoot", () => {
		const q = generateMelodyQuestion(1);
		expect(q.data.root).toBe("C");
	});

	it("fixedRoot constrains the root note", () => {
		const q = generateMelodyQuestion(1, "E");
		expect(q.data.root).toBe("E");
	});

	it("data includes root and scaleNotes", () => {
		const q = generateMelodyQuestion(1);
		expect(q.data.root).toBeDefined();
		expect(q.data.scaleNotes.length).toBeGreaterThan(0);
	});

	it("notesWithOctave has same length as notes", () => {
		const q = generateMelodyQuestion(2);
		expect(q.data.notesWithOctave).toHaveLength(q.data.notes.length);
		for (const nwo of q.data.notesWithOctave) {
			expect(nwo).toMatch(/^[A-G]#?\d$/);
		}
	});
});
