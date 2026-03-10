import { describe, expect, it } from "vitest";
import { calculateLevelAdjustment } from "../../../src/lib/training/levelManager";

describe("levelManager", () => {
	describe("calculateLevelAdjustment", () => {
		it("正答率85%以上でレベルアップ", () => {
			const results = Array.from({ length: 10 }, (_, i) => ({
				isCorrect: i < 9, // 90%
			}));
			const adjustment = calculateLevelAdjustment(1, 5, results);
			expect(adjustment.reason).toBe("up");
			expect(adjustment.newLevel).toBe(2);
		});

		it("正答率45%以下でレベルダウン", () => {
			const results = Array.from({ length: 10 }, (_, i) => ({
				isCorrect: i < 4, // 40%
			}));
			const adjustment = calculateLevelAdjustment(3, 5, results);
			expect(adjustment.reason).toBe("down");
			expect(adjustment.newLevel).toBe(2);
		});

		it("中間の正答率ではレベル変更なし", () => {
			const results = Array.from({ length: 10 }, (_, i) => ({
				isCorrect: i < 7, // 70%
			}));
			const adjustment = calculateLevelAdjustment(3, 5, results);
			expect(adjustment.reason).toBe("none");
			expect(adjustment.newLevel).toBe(3);
		});

		it("最大レベルを超えない", () => {
			const results = Array.from({ length: 10 }, () => ({
				isCorrect: true,
			}));
			const adjustment = calculateLevelAdjustment(5, 5, results);
			expect(adjustment.reason).toBe("none");
			expect(adjustment.newLevel).toBe(5);
		});

		it("レベル1未満にならない", () => {
			const results = Array.from({ length: 10 }, () => ({
				isCorrect: false,
			}));
			const adjustment = calculateLevelAdjustment(1, 5, results);
			expect(adjustment.reason).toBe("none");
			expect(adjustment.newLevel).toBe(1);
		});

		it("データが不足している場合は変更なし", () => {
			const results = [{ isCorrect: true }, { isCorrect: false }];
			const adjustment = calculateLevelAdjustment(3, 5, results);
			expect(adjustment.reason).toBe("none");
			expect(adjustment.newLevel).toBe(3);
		});

		it("カスタムwindowSizeで動作する", () => {
			const results = Array.from({ length: 5 }, () => ({
				isCorrect: true,
			}));
			const adjustment = calculateLevelAdjustment(1, 5, results, 5);
			expect(adjustment.reason).toBe("up");
			expect(adjustment.newLevel).toBe(2);
		});
	});
});
