import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateIntervalQuestion = vi.fn().mockReturnValue({
	data: { root: "C4", target: "E4", interval: "M3", direction: "ascending" },
	correctAnswer: "M3",
	choices: ["M3", "m3", "P4", "P5"],
});

const mockGenerateScaleQuestion = vi.fn().mockReturnValue({
	data: {
		root: "C",
		mode: "dorian",
		notes: ["C", "D", "Eb", "F", "G", "A", "Bb"],
	},
	correctAnswer: "dorian",
	choices: ["dorian", "mixolydian", "aeolian", "ionian"],
});

const mockGenerateProgressionQuestion = vi.fn().mockReturnValue({
	data: { key: { root: "C", mode: "major" }, degrees: ["I", "IV", "V", "I"], chords: [] },
	correctAnswer: "I-IV-V-I",
	choices: ["I-IV-V-I", "II-V-I-VI"],
});

const mockGenerateMelodyQuestion = vi.fn().mockReturnValue({
	data: { root: "C", notes: ["C", "D", "E"], notesWithOctave: ["C4", "D4", "E4"], scaleNotes: [] },
	correctAnswer: "C4,D4,E4",
	choices: [],
});

const mockGenerateVoicingQuestion = vi.fn().mockReturnValue({
	data: {
		root: "C", quality: "maj7", voicingType: "rootPosition",
		notes: ["C4", "E4", "G4", "B4"],
		qualityChoices: ["maj7", "dom7", "min7"],
		voicingChoices: ["rootPosition", "firstInversion"],
	},
	correctAnswer: "maj7|rootPosition",
	choices: ["maj7|rootPosition", "dom7|firstInversion"],
});

const mockGenerateFunctionalHarmonyQuestion = vi.fn().mockReturnValue({
	data: { key: { root: "C", mode: "major" }, degree: "V", chordRoot: "G", chordQuality: "dom7", chordNotes: ["G", "B", "D", "F"], correctFunction: "dominant" },
	correctAnswer: "dominant",
	choices: ["tonic", "subdominant", "dominant"],
});

vi.mock("../lib/training/questionGenerator", () => ({
	generateIntervalQuestion: (...args: unknown[]) =>
		mockGenerateIntervalQuestion(...args),
	generateScaleQuestion: (...args: unknown[]) =>
		mockGenerateScaleQuestion(...args),
	generateProgressionQuestion: (...args: unknown[]) =>
		mockGenerateProgressionQuestion(...args),
	generateMelodyQuestion: (...args: unknown[]) =>
		mockGenerateMelodyQuestion(...args),
	generateVoicingQuestion: (...args: unknown[]) =>
		mockGenerateVoicingQuestion(...args),
	generateFunctionalHarmonyQuestion: (...args: unknown[]) =>
		mockGenerateFunctionalHarmonyQuestion(...args),
}));

vi.mock("../lib/training/levelManager", () => ({
	calculateLevelAdjustment: vi.fn().mockReturnValue({
		newLevel: 1,
		reason: "none",
	}),
}));

import { useTrainingStore } from "./trainingStore";

describe("trainingStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useTrainingStore.getState().resetSession();
	});

	describe("initial state", () => {
		it("should have null category and no question", () => {
			const state = useTrainingStore.getState();
			expect(state.category).toBeNull();
			expect(state.currentQuestion).toBeNull();
			expect(state.sessionComplete).toBe(false);
		});
	});

	describe("startSession", () => {
		it("should set category, level, and generate first question", () => {
			act(() => {
				useTrainingStore.getState().startSession("interval", 1);
			});

			const state = useTrainingStore.getState();
			expect(state.category).toBe("interval");
			expect(state.level).toBe(1);
			expect(state.currentQuestion).not.toBeNull();
			expect(state.questionIndex).toBe(0);
			expect(state.totalQuestions).toBe(5);
			expect(state.sessionResults).toEqual([]);
		});

		it("should accept custom totalQuestions", () => {
			act(() => {
				useTrainingStore.getState().startSession("voicing", 2, 5);
			});

			expect(useTrainingStore.getState().totalQuestions).toBe(5);
		});
	});

	describe("submitAnswer", () => {
		it("should record correct answer", () => {
			act(() => {
				useTrainingStore.getState().startSession("interval", 1);
			});

			act(() => {
				useTrainingStore.getState().submitAnswer("M3");
			});

			const state = useTrainingStore.getState();
			expect(state.selectedAnswer).toBe("M3");
			expect(state.showFeedback).toBe(true);
			expect(state.sessionResults).toHaveLength(1);
			expect(state.sessionResults[0].isCorrect).toBe(true);
		});

		it("should record incorrect answer", () => {
			act(() => {
				useTrainingStore.getState().startSession("interval", 1);
			});

			act(() => {
				useTrainingStore.getState().submitAnswer("P5");
			});

			const state = useTrainingStore.getState();
			expect(state.sessionResults[0].isCorrect).toBe(false);
			expect(state.sessionResults[0].userAnswer).toBe("P5");
		});

		it("should record response time", () => {
			act(() => {
				useTrainingStore.getState().startSession("interval", 1);
			});

			act(() => {
				useTrainingStore.getState().submitAnswer("M3");
			});

			const state = useTrainingStore.getState();
			expect(state.sessionResults[0].responseTimeMs).toBeGreaterThanOrEqual(0);
		});
	});

	describe("nextQuestion", () => {
		it("should generate next question and increment index", () => {
			act(() => {
				useTrainingStore.getState().startSession("interval", 1);
			});

			act(() => {
				useTrainingStore.getState().submitAnswer("M3");
			});

			act(() => {
				useTrainingStore.getState().nextQuestion();
			});

			const state = useTrainingStore.getState();
			expect(state.questionIndex).toBe(1);
			expect(state.selectedAnswer).toBeNull();
			expect(state.showFeedback).toBe(false);
		});

		it("should set sessionComplete when all questions answered", () => {
			act(() => {
				useTrainingStore.getState().startSession("interval", 1, 2);
			});

			act(() => {
				useTrainingStore.getState().submitAnswer("M3");
			});
			act(() => {
				useTrainingStore.getState().nextQuestion();
			});

			act(() => {
				useTrainingStore.getState().submitAnswer("M3");
			});
			act(() => {
				useTrainingStore.getState().nextQuestion();
			});

			expect(useTrainingStore.getState().sessionComplete).toBe(true);
		});
	});

	describe("endSession", () => {
		it("should reset session state", () => {
			act(() => {
				useTrainingStore.getState().startSession("interval", 1);
			});
			act(() => {
				useTrainingStore.getState().submitAnswer("M3");
			});
			act(() => {
				useTrainingStore.getState().endSession();
			});

			const state = useTrainingStore.getState();
			expect(state.category).toBeNull();
			expect(state.currentQuestion).toBeNull();
		});
	});

	describe("category-specific question generation", () => {
		it("should use voicing generator for voicing category", () => {
			act(() => {
				useTrainingStore.getState().startSession("voicing", 3);
			});

			expect(mockGenerateVoicingQuestion).toHaveBeenCalledWith(3, undefined);
		});

		it("should use scale generator for scale category", () => {
			act(() => {
				useTrainingStore.getState().startSession("scale", 2);
			});

			expect(mockGenerateScaleQuestion).toHaveBeenCalledWith(2, undefined);
		});
	});
});
