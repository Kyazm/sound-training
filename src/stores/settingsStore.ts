import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NoteName } from "../types/music";
import type { TrainingCategory } from "../types/training";

export type IntervalPlayMode = "melodic" | "harmonic";
export type ChordPlayMode = "block" | "arpeggio";

interface SettingsState {
	fixedKey: boolean;
	fixedKeyRoot: NoteName;
	adminLevelOverrides: Partial<Record<TrainingCategory, number>>;
	levelOverrides: Partial<Record<TrainingCategory, number>>;
	intervalPlayMode: IntervalPlayMode;
	chordPlayMode: ChordPlayMode;
	setFixedKey: (enabled: boolean) => void;
	setFixedKeyRoot: (root: NoteName) => void;
	setAdminLevel: (category: TrainingCategory, level: number) => void;
	setLevelOverride: (category: TrainingCategory, level: number) => void;
	setIntervalPlayMode: (mode: IntervalPlayMode) => void;
	setChordPlayMode: (mode: ChordPlayMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			fixedKey: false,
			fixedKeyRoot: "C",
			adminLevelOverrides: {},
			levelOverrides: {},
			intervalPlayMode: "melodic" as IntervalPlayMode,
			chordPlayMode: "block" as ChordPlayMode,
			setFixedKey: (enabled) => set({ fixedKey: enabled }),
			setFixedKeyRoot: (root) => set({ fixedKeyRoot: root }),
			setAdminLevel: (category, level) =>
				set((state) => ({
					adminLevelOverrides: {
						...state.adminLevelOverrides,
						[category]: level,
					},
				})),
			setLevelOverride: (category, level) =>
				set((state) => ({
					levelOverrides: {
						...state.levelOverrides,
						[category]: level,
					},
				})),
			setIntervalPlayMode: (mode) => set({ intervalPlayMode: mode }),
			setChordPlayMode: (mode) => set({ chordPlayMode: mode }),
		}),
		{ name: "sound-training-settings" },
	),
);
