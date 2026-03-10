import { create } from "zustand";
import { audioEngine } from "../lib/audio/AudioEngine";

interface AudioState {
	isInitialized: boolean;
	isPlaying: boolean;
	volume: number;
	initialize: () => Promise<void>;
	setVolume: (volume: number) => void;
	setPlaying: (playing: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
	isInitialized: false,
	isPlaying: false,
	volume: -6,

	initialize: async () => {
		await audioEngine.init();
		set({ isInitialized: true });
	},

	setVolume: (volume) => {
		audioEngine.setVolume(volume);
		set({ volume });
	},

	setPlaying: (playing) => {
		set({ isPlaying: playing });
	},
}));
