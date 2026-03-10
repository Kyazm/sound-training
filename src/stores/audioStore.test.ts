import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/audio/AudioEngine", () => ({
	audioEngine: {
		init: vi.fn().mockResolvedValue(undefined),
		setVolume: vi.fn(),
	},
}));

import { audioEngine } from "../lib/audio/AudioEngine";
import { useAudioStore } from "./audioStore";

describe("audioStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset store state
		useAudioStore.setState({
			isInitialized: false,
			isPlaying: false,
			volume: -6,
		});
	});

	it("should have correct initial state", () => {
		const state = useAudioStore.getState();
		expect(state.isInitialized).toBe(false);
		expect(state.isPlaying).toBe(false);
		expect(state.volume).toBe(-6);
	});

	it("should initialize audio engine", async () => {
		await act(async () => {
			await useAudioStore.getState().initialize();
		});

		expect(audioEngine.init).toHaveBeenCalled();
		expect(useAudioStore.getState().isInitialized).toBe(true);
	});

	it("should set volume", () => {
		act(() => {
			useAudioStore.getState().setVolume(-12);
		});

		expect(audioEngine.setVolume).toHaveBeenCalledWith(-12);
		expect(useAudioStore.getState().volume).toBe(-12);
	});

	it("should set playing state", () => {
		act(() => {
			useAudioStore.getState().setPlaying(true);
		});

		expect(useAudioStore.getState().isPlaying).toBe(true);
	});
});
