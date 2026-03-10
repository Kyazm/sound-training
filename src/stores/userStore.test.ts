import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSingle = vi.hoisted(() => vi.fn());
const mockEq = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockUpsert = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("../lib/supabase", () => {
	const chain = {
		select: mockSelect,
		eq: mockEq,
		single: mockSingle,
		insert: mockInsert,
		update: mockUpdate,
		upsert: mockUpsert,
	};
	mockSelect.mockReturnValue(chain);
	mockEq.mockReturnValue(chain);
	mockUpdate.mockReturnValue(chain);
	mockFrom.mockReturnValue(chain);

	return {
		supabase: { from: mockFrom },
	};
});

vi.mock("./authStore", () => ({
	useAuthStore: {
		getState: vi.fn().mockReturnValue({
			user: { id: "test-user-id" },
		}),
	},
}));

import { useUserStore } from "./userStore";

describe("userStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Re-setup chain returns after clearAllMocks
		const chain = {
			select: mockSelect,
			eq: mockEq,
			single: mockSingle,
			insert: mockInsert,
			update: mockUpdate,
			upsert: mockUpsert,
		};
		mockSelect.mockReturnValue(chain);
		mockEq.mockReturnValue(chain);
		mockUpdate.mockReturnValue(chain);
		mockFrom.mockReturnValue(chain);

		useUserStore.setState({
			profile: null,
			categoryProgress: {},
			levelStats: {},
			wrongAnswers: [],
			loading: false,
		});
	});

	describe("fetchProfile", () => {
		it("should fetch and set profile data", async () => {
			mockSingle.mockResolvedValue({
				data: {
					id: "test-user-id",
					display_name: "Test User",
					level: 3,
					total_xp: 250,
					current_streak: 5,
					longest_streak: 10,
					last_practice_date: "2026-03-09",
					settings: { playbackSpeed: 1, fixedKey: null, darkMode: true },
				},
				error: null,
			});

			await act(async () => {
				await useUserStore.getState().fetchProfile("test-user-id");
			});

			const state = useUserStore.getState();
			expect(state.profile).not.toBeNull();
			expect(state.profile?.displayName).toBe("Test User");
			expect(state.profile?.level).toBe(3);
			expect(state.profile?.totalXP).toBe(250);
		});

		it("should handle error gracefully", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mockSingle.mockResolvedValue({
				data: null,
				error: { message: "Not found" },
			});

			await act(async () => {
				await useUserStore.getState().fetchProfile("test-user-id");
			});

			expect(useUserStore.getState().profile).toBeNull();
			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});

	describe("fetchCategoryProgress", () => {
		it("should fetch and set category progress", async () => {
			mockEq.mockResolvedValue({
				data: [
					{
						category: "interval",
						current_level: 3,
						total_correct: 50,
						total_attempts: 80,
					},
				],
				error: null,
			});

			await act(async () => {
				await useUserStore.getState().fetchCategoryProgress("test-user-id");
			});

			const state = useUserStore.getState();
			expect(state.categoryProgress.interval).toBeDefined();
			expect(state.categoryProgress.interval.currentLevel).toBe(3);
		});
	});

	describe("addXP", () => {
		it("should add XP and recalculate level", async () => {
			useUserStore.setState({
				profile: {
					id: "test-user-id",
					displayName: "Test",
					level: 1,
					totalXP: 50,
					currentStreak: 1,
					longestStreak: 1,
					lastPracticeDate: null,
					settings: { playbackSpeed: 1, fixedKey: null, darkMode: true },
				},
			});

			mockEq.mockResolvedValue({ error: null });

			await act(async () => {
				await useUserStore.getState().addXP(60);
			});

			const state = useUserStore.getState();
			expect(state.profile?.totalXP).toBe(110);
			expect(state.profile?.level).toBe(2);
		});
	});

	describe("updateStreak", () => {
		it("should increment streak if last practice was yesterday", async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			useUserStore.setState({
				profile: {
					id: "test-user-id",
					displayName: "Test",
					level: 1,
					totalXP: 0,
					currentStreak: 3,
					longestStreak: 5,
					lastPracticeDate: yesterday.toISOString().split("T")[0],
					settings: { playbackSpeed: 1, fixedKey: null, darkMode: true },
				},
			});

			mockEq.mockResolvedValue({ error: null });

			await act(async () => {
				await useUserStore.getState().updateStreak();
			});

			expect(useUserStore.getState().profile?.currentStreak).toBe(4);
		});

		it("should not change streak if last practice was today", async () => {
			const today = new Date().toISOString().split("T")[0];

			useUserStore.setState({
				profile: {
					id: "test-user-id",
					displayName: "Test",
					level: 1,
					totalXP: 0,
					currentStreak: 3,
					longestStreak: 5,
					lastPracticeDate: today,
					settings: { playbackSpeed: 1, fixedKey: null, darkMode: true },
				},
			});

			await act(async () => {
				await useUserStore.getState().updateStreak();
			});

			expect(useUserStore.getState().profile?.currentStreak).toBe(3);
		});

		it("should reset streak to 1 if gap is more than 1 day", async () => {
			const threeDaysAgo = new Date();
			threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

			useUserStore.setState({
				profile: {
					id: "test-user-id",
					displayName: "Test",
					level: 1,
					totalXP: 0,
					currentStreak: 10,
					longestStreak: 15,
					lastPracticeDate: threeDaysAgo.toISOString().split("T")[0],
					settings: { playbackSpeed: 1, fixedKey: null, darkMode: true },
				},
			});

			mockEq.mockResolvedValue({ error: null });

			await act(async () => {
				await useUserStore.getState().updateStreak();
			});

			expect(useUserStore.getState().profile?.currentStreak).toBe(1);
		});
	});
});
