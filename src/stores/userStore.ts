import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { UserSettings } from "../types/database";
import type { ExerciseRecord, TrainingCategory } from "../types/training";
import { useAuthStore } from "./authStore";

interface CategoryProgress {
	category: string;
	currentLevel: number;
	totalCorrect: number;
	totalAttempts: number;
}

export interface LevelStats {
	correct: number;
	attempts: number;
}

export interface WrongAnswerRecord {
	category: TrainingCategory;
	level: number;
	correctAnswer: string;
	userAnswer: string;
	createdAt: string;
}

interface UserProfile {
	id: string;
	displayName: string | null;
	level: number;
	totalXP: number;
	currentStreak: number;
	longestStreak: number;
	lastPracticeDate: string | null;
	settings: UserSettings;
}

interface UserState {
	profile: UserProfile | null;
	categoryProgress: Record<string, CategoryProgress>;
	/** per-category per-level stats from exercise_records */
	levelStats: Record<string, Record<number, LevelStats>>;
	/** recent wrong answers from exercise_records */
	wrongAnswers: WrongAnswerRecord[];
	loading: boolean;
	fetchProfile: (userId: string) => Promise<void>;
	fetchCategoryProgress: (userId: string) => Promise<void>;
	fetchLevelStats: (userId: string) => Promise<void>;
	fetchWrongAnswers: (userId: string) => Promise<void>;
	addXP: (amount: number) => Promise<void>;
	updateStreak: () => Promise<void>;
	updateCategoryProgress: (
		category: string,
		correct: number,
		attempts: number,
		level: number,
	) => Promise<void>;
	saveExerciseRecords: (records: ExerciseRecord[]) => Promise<void>;
}

function getToday(): string {
	return new Date().toISOString().split("T")[0];
}

function diffDays(dateStr: string): number {
	const date = new Date(dateStr);
	const today = new Date(getToday());
	return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export const useUserStore = create<UserState>((set, get) => ({
	profile: null,
	categoryProgress: {},
	levelStats: {},
	wrongAnswers: [],
	loading: false,

	fetchProfile: async (userId) => {
		set({ loading: true });
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (error || !data) {
			console.error("Failed to fetch profile:", error);
			set({ loading: false });
			return;
		}

		const row = data as Record<string, unknown>;
		set({
			profile: {
				id: row.id as string,
				displayName: (row.display_name as string) ?? null,
				level: (row.level as number) ?? 1,
				totalXP: (row.total_xp as number) ?? 0,
				currentStreak: (row.current_streak as number) ?? 0,
				longestStreak: (row.longest_streak as number) ?? 0,
				lastPracticeDate: (row.last_practice_date as string) ?? null,
				settings: (row.settings as UserSettings) ?? {
					playbackSpeed: 1.0,
					fixedKey: null,
					darkMode: true,
				},
			},
			loading: false,
		});
	},

	fetchCategoryProgress: async (userId) => {
		const { data, error } = await supabase
			.from("category_progress")
			.select("*")
			.eq("user_id", userId);

		if (error) {
			console.error("Failed to fetch category progress:", error);
			return;
		}

		const progress: Record<string, CategoryProgress> = {};
		for (const item of data as Record<string, unknown>[]) {
			const cat = item.category as string;
			progress[cat] = {
				category: cat,
				currentLevel: (item.current_level as number) ?? 1,
				totalCorrect: (item.total_correct as number) ?? 0,
				totalAttempts: (item.total_attempts as number) ?? 0,
			};
		}
		set({ categoryProgress: progress });
	},

	fetchLevelStats: async (userId) => {
		// Aggregate exercise_records by category + level
		const { data, error } = await supabase
			.from("exercise_records")
			.select("category, level, is_correct")
			.eq("user_id", userId);

		if (error) {
			console.error("Failed to fetch level stats:", error);
			return;
		}

		const stats: Record<string, Record<number, LevelStats>> = {};
		for (const row of data as { category: string; level: number; is_correct: boolean }[]) {
			if (!stats[row.category]) stats[row.category] = {};
			if (!stats[row.category][row.level]) {
				stats[row.category][row.level] = { correct: 0, attempts: 0 };
			}
			stats[row.category][row.level].attempts++;
			if (row.is_correct) stats[row.category][row.level].correct++;
		}
		set({ levelStats: stats });
	},

	fetchWrongAnswers: async (userId) => {
		const { data, error } = await supabase
			.from("exercise_records")
			.select("category, level, correct_answer, user_answer, created_at")
			.eq("user_id", userId)
			.eq("is_correct", false)
			.order("created_at", { ascending: false })
			.limit(200);

		if (error) {
			console.error("Failed to fetch wrong answers:", error);
			return;
		}

		const wrongAnswers: WrongAnswerRecord[] = (
			data as { category: string; level: number; correct_answer: string; user_answer: string; created_at: string }[]
		).map((row) => ({
			category: row.category as TrainingCategory,
			level: row.level,
			correctAnswer: row.correct_answer,
			userAnswer: row.user_answer,
			createdAt: row.created_at,
		}));

		set({ wrongAnswers });
	},

	addXP: async (amount) => {
		const { profile } = get();
		if (!profile) return;

		const newXP = profile.totalXP + amount;
		const newLevel = Math.floor(newXP / 100) + 1;

		const { error } = await supabase
			.from("profiles")
			.update({ total_xp: newXP, level: newLevel } as never)
			.eq("id", profile.id);

		if (error) {
			console.error("Failed to add XP:", error);
			return;
		}

		set({
			profile: { ...profile, totalXP: newXP, level: newLevel },
		});
	},

	updateStreak: async () => {
		const { profile } = get();
		if (!profile) return;

		const today = getToday();

		if (profile.lastPracticeDate === today) return;

		let newStreak: number;
		if (profile.lastPracticeDate && diffDays(profile.lastPracticeDate) === 1) {
			newStreak = profile.currentStreak + 1;
		} else {
			newStreak = 1;
		}

		const newLongest = Math.max(profile.longestStreak, newStreak);

		const { error } = await supabase
			.from("profiles")
			.update({
				current_streak: newStreak,
				longest_streak: newLongest,
				last_practice_date: today,
			} as never)
			.eq("id", profile.id);

		if (error) {
			console.error("Failed to update streak:", error);
			return;
		}

		set({
			profile: {
				...profile,
				currentStreak: newStreak,
				longestStreak: newLongest,
				lastPracticeDate: today,
			},
		});
	},

	updateCategoryProgress: async (category, correct, attempts, level) => {
		const user = useAuthStore.getState().user;
		if (!user) return;

		const existing = get().categoryProgress[category];
		const totalCorrect = (existing?.totalCorrect ?? 0) + correct;
		const totalAttempts = (existing?.totalAttempts ?? 0) + attempts;

		const { error } = await supabase.from("category_progress").upsert({
			user_id: user.id,
			category,
			current_level: level,
			total_correct: totalCorrect,
			total_attempts: totalAttempts,
		} as never);

		if (error) {
			console.error("Failed to update category progress:", error);
			return;
		}

		set((state) => ({
			categoryProgress: {
				...state.categoryProgress,
				[category]: {
					category,
					currentLevel: level,
					totalCorrect,
					totalAttempts,
				},
			},
		}));
	},

	saveExerciseRecords: async (records) => {
		const user = useAuthStore.getState().user;
		if (!user || records.length === 0) return;

		const rows = records.map((r) => ({
			user_id: user.id,
			category: r.category,
			subcategory: r.subcategory,
			level: r.level,
			question: null,
			correct_answer: r.correctAnswer,
			user_answer: r.userAnswer,
			is_correct: r.isCorrect,
			response_time_ms: r.responseTimeMs,
		}));

		const { error } = await supabase
			.from("exercise_records")
			.insert(rows as never);

		if (error) {
			console.error("Failed to save exercise records:", error);
		}
	},
}));
