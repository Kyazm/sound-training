import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("tone", () => {
	const mockSynth = {
		triggerAttackRelease: vi.fn(),
		releaseAll: vi.fn(),
		disconnect: vi.fn().mockReturnThis(),
		dispose: vi.fn(),
		toDestination: vi.fn().mockReturnThis(),
		volume: { value: 0 },
		maxPolyphony: 10,
	};

	return {
		start: vi.fn().mockResolvedValue(undefined),
		now: vi.fn().mockReturnValue(0),
		context: { resume: vi.fn().mockResolvedValue(undefined) },
		PolySynth: vi.fn().mockImplementation(() => mockSynth),
		Synth: vi.fn(),
		getTransport: vi.fn().mockReturnValue({
			cancel: vi.fn(),
			stop: vi.fn(),
		}),
	};
});

import * as Tone from "tone";
import { audioEngine } from "./AudioEngine";

function getSynth() {
	// biome-ignore lint/suspicious/noExplicitAny: test helper
	return (audioEngine as any).synth;
}

describe("AudioEngine", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		// biome-ignore lint/suspicious/noExplicitAny: test reset
		(audioEngine as any).initialized = false;
		// biome-ignore lint/suspicious/noExplicitAny: test reset
		(audioEngine as any).synth = null;
	});

	describe("init", () => {
		it("should initialize Tone.js and create synth", async () => {
			await audioEngine.init();

			expect(Tone.start).toHaveBeenCalled();
			expect(Tone.PolySynth).toHaveBeenCalled();
			expect(audioEngine.isReady()).toBe(true);
		});

		it("should not re-initialize if already initialized", async () => {
			await audioEngine.init();
			await audioEngine.init();

			expect(Tone.start).toHaveBeenCalledTimes(1);
		});
	});

	describe("isReady", () => {
		it("should return false before init", () => {
			expect(audioEngine.isReady()).toBe(false);
		});

		it("should return true after init", async () => {
			await audioEngine.init();
			expect(audioEngine.isReady()).toBe(true);
		});
	});

	describe("playNote", () => {
		it("should call triggerAttackRelease with note and duration", async () => {
			await audioEngine.init();
			audioEngine.playNote("C4");

			expect(getSynth().triggerAttackRelease).toHaveBeenCalledWith(
				"C4",
				expect.any(Number),
				expect.any(Number),
			);
		});

		it("should use custom duration when provided", async () => {
			await audioEngine.init();
			audioEngine.playNote("C4", 2);

			expect(getSynth().triggerAttackRelease).toHaveBeenCalledWith("C4", 2, 0);
		});

		it("should not throw if not initialized", () => {
			expect(() => audioEngine.playNote("C4")).not.toThrow();
		});
	});

	describe("playInterval", () => {
		it("should play melodic interval with delay", async () => {
			await audioEngine.init();
			audioEngine.playInterval("C4", "E4", "melodic");

			expect(getSynth().triggerAttackRelease).toHaveBeenCalledTimes(2);
		});

		it("should play harmonic interval simultaneously", async () => {
			await audioEngine.init();
			audioEngine.playInterval("C4", "E4", "harmonic");

			const calls = getSynth().triggerAttackRelease.mock.calls;
			expect(calls).toHaveLength(2);
			// Both at same time
			expect(calls[0][2]).toBe(calls[1][2]);
		});
	});

	describe("playChord", () => {
		it("should play block chord with all notes at once", async () => {
			await audioEngine.init();
			audioEngine.playChord(["C4", "E4", "G4"], "block");

			expect(getSynth().triggerAttackRelease).toHaveBeenCalledTimes(3);
		});

		it("should play arpeggio with staggered notes", async () => {
			await audioEngine.init();
			audioEngine.playChord(["C4", "E4", "G4"], "arpeggio");

			const calls = getSynth().triggerAttackRelease.mock.calls;
			expect(calls).toHaveLength(3);
			// Each note at a different time
			expect(calls[1][2]).toBeGreaterThan(calls[0][2]);
			expect(calls[2][2]).toBeGreaterThan(calls[1][2]);
		});
	});

	describe("playProgression", () => {
		it("should play each chord in sequence", async () => {
			await audioEngine.init();
			audioEngine.playProgression([
				["C4", "E4", "G4"],
				["F4", "A4", "C5"],
			]);

			expect(getSynth().triggerAttackRelease).toHaveBeenCalledTimes(6);
		});
	});

	describe("playScale", () => {
		it("should play notes in sequence", async () => {
			await audioEngine.init();
			audioEngine.playScale(["C4", "D4", "E4", "F4", "G4"]);

			expect(getSynth().triggerAttackRelease).toHaveBeenCalledTimes(5);
		});

		it("should reverse notes when descending", async () => {
			await audioEngine.init();
			audioEngine.playScale(["C4", "D4", "E4"], false);

			const calls = getSynth().triggerAttackRelease.mock.calls;
			expect(calls).toHaveLength(3);
			expect(calls[0][0]).toBe("E4");
		});
	});

	describe("stop", () => {
		it("should dispose synth and recreate", async () => {
			await audioEngine.init();
			const oldSynth = getSynth();
			audioEngine.stop();

			expect(oldSynth.disconnect).toHaveBeenCalled();
			expect(oldSynth.dispose).toHaveBeenCalled();
			// A new synth should be created
			expect(getSynth()).toBeTruthy();
		});
	});

	describe("setVolume", () => {
		it("should set volume in dB", async () => {
			await audioEngine.init();
			audioEngine.setVolume(-10);

			expect(getSynth().volume.value).toBe(-10);
		});
	});
});
