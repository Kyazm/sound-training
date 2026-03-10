import { describe, expect, it } from "vitest";
import {
	createInitialItem,
	isDueForReview,
	updateRepetitionItem,
} from "../../../src/lib/training/spacedRepetition";

describe("spacedRepetition", () => {
	describe("createInitialItem", () => {
		it("デフォルト値で初期アイテムを生成する", () => {
			const item = createInitialItem();
			expect(item.easeFactor).toBe(2.5);
			expect(item.intervalDays).toBe(1);
			expect(item.repetitions).toBe(0);
			expect(item.nextReviewDate).toBeNull();
			expect(item.lastReviewDate).toBeNull();
		});
	});

	describe("updateRepetitionItem", () => {
		it("完璧な回答(quality=5)でインターバルが増加する", () => {
			const item = createInitialItem();
			const updated = updateRepetitionItem(item, 5);
			expect(updated.repetitions).toBe(1);
			expect(updated.intervalDays).toBe(1);
			expect(updated.easeFactor).toBeGreaterThanOrEqual(2.5);
			expect(updated.nextReviewDate).not.toBeNull();
			expect(updated.lastReviewDate).not.toBeNull();
		});

		it("2回目の正解でインターバルが6日になる", () => {
			let item = createInitialItem();
			item = updateRepetitionItem(item, 5);
			item = updateRepetitionItem(item, 5);
			expect(item.repetitions).toBe(2);
			expect(item.intervalDays).toBe(6);
		});

		it("3回目以降は interval * easeFactor で計算される", () => {
			let item = createInitialItem();
			item = updateRepetitionItem(item, 5); // rep=1, interval=1
			item = updateRepetitionItem(item, 5); // rep=2, interval=6
			const efBefore = item.easeFactor;
			item = updateRepetitionItem(item, 4); // rep=3, interval=6*ef
			expect(item.repetitions).toBe(3);
			expect(item.intervalDays).toBe(Math.round(6 * efBefore));
		});

		it("失敗(quality<3)でリセットされる", () => {
			let item = createInitialItem();
			item = updateRepetitionItem(item, 5);
			item = updateRepetitionItem(item, 5);
			const efBefore = item.easeFactor;
			item = updateRepetitionItem(item, 2);
			expect(item.repetitions).toBe(0);
			expect(item.intervalDays).toBe(1);
			expect(item.easeFactor).toBe(efBefore);
		});

		it("ease factorが1.3未満にならない", () => {
			let item = createInitialItem();
			// quality=3を繰り返してease factorを下げる
			for (let i = 0; i < 20; i++) {
				item = updateRepetitionItem(item, 3);
			}
			expect(item.easeFactor).toBeGreaterThanOrEqual(1.3);
		});

		it("quality=0で完全失敗してもease factorは変わらない", () => {
			const item = createInitialItem();
			const updated = updateRepetitionItem(item, 0);
			expect(updated.easeFactor).toBe(item.easeFactor);
			expect(updated.repetitions).toBe(0);
			expect(updated.intervalDays).toBe(1);
		});
	});

	describe("isDueForReview", () => {
		it("nextReviewDateがnullならレビュー対象", () => {
			const item = createInitialItem();
			expect(isDueForReview(item)).toBe(true);
		});

		it("nextReviewDateが過去ならレビュー対象", () => {
			const item = createInitialItem();
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			item.nextReviewDate = yesterday.toISOString();
			expect(isDueForReview(item)).toBe(true);
		});

		it("nextReviewDateが未来ならレビュー対象外", () => {
			const item = createInitialItem();
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			item.nextReviewDate = tomorrow.toISOString();
			expect(isDueForReview(item)).toBe(false);
		});
	});
});
