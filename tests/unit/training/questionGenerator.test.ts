import { describe, expect, it } from "vitest";
import {
	generateIntervalQuestion,
	generateScaleQuestion,
	generateVoicingQuestion,
} from "../../../src/lib/training/questionGenerator";

describe("questionGenerator", () => {
	describe("generateIntervalQuestion", () => {
		it("レベル1で有効なインターバル問題を生成する", () => {
			const q = generateIntervalQuestion(1);
			expect(q.data.root).toBeDefined();
			expect(q.data.target).toBeDefined();
			expect(q.data.interval).toBeDefined();
			expect(q.correctAnswer).toBeDefined();
			expect(q.choices).toContain(q.correctAnswer);
			expect(q.choices.length).toBeGreaterThanOrEqual(3);
		});

		it("レベル5で全インターバルを含む可能性がある", () => {
			const q = generateIntervalQuestion(5);
			expect(q.choices.length).toBeGreaterThanOrEqual(4);
			expect(q.choices).toContain(q.correctAnswer);
		});

		it("選択肢に重複がない", () => {
			for (let i = 0; i < 20; i++) {
				const q = generateIntervalQuestion(3);
				const unique = new Set(q.choices);
				expect(unique.size).toBe(q.choices.length);
			}
		});
	});

	describe("generateVoicingQuestion", () => {
		it("レベル1で基本的なボイシング問題を生成する", () => {
			const q = generateVoicingQuestion(1);
			expect(q.data.root).toBeDefined();
			expect(q.data.quality).toBeDefined();
			expect(q.data.voicingType).toBeDefined();
			expect(q.data.qualityChoices.length).toBeGreaterThanOrEqual(2);
			expect(q.data.voicingChoices.length).toBeGreaterThanOrEqual(1);
			expect(q.correctAnswer).toContain("|");
		});

		it("レベル7で拡張コードとボイシングを含む", () => {
			const q = generateVoicingQuestion(7);
			expect(q.data.qualityChoices.length).toBeGreaterThanOrEqual(4);
			expect(q.data.voicingChoices.length).toBeGreaterThanOrEqual(4);
			const [quality, voicing] = q.correctAnswer.split("|");
			expect(q.data.qualityChoices).toContain(quality);
			expect(q.data.voicingChoices).toContain(voicing);
		});

		it("正解がchoicesに含まれる", () => {
			for (let i = 0; i < 20; i++) {
				const level = Math.floor(Math.random() * 7) + 1;
				const q = generateVoicingQuestion(level);
				const [quality, voicing] = q.correctAnswer.split("|");
				expect(q.data.qualityChoices).toContain(quality);
				expect(q.data.voicingChoices).toContain(voicing);
			}
		});
	});

	describe("generateScaleQuestion", () => {
		it("レベル1で基本的なスケール問題を生成する", () => {
			const q = generateScaleQuestion(1);
			expect(q.data.root).toBeDefined();
			expect(q.data.mode).toBeDefined();
			expect(q.data.notes.length).toBeGreaterThanOrEqual(7);
			expect(q.correctAnswer).toBeDefined();
			expect(q.choices).toContain(q.correctAnswer);
		});

		it("選択肢に重複がない", () => {
			for (let i = 0; i < 20; i++) {
				const q = generateScaleQuestion(3);
				const unique = new Set(q.choices);
				expect(unique.size).toBe(q.choices.length);
			}
		});

		it("レベル6で全スケールモードを含む可能性がある", () => {
			const q = generateScaleQuestion(6);
			expect(q.choices.length).toBeGreaterThanOrEqual(4);
			expect(q.choices).toContain(q.correctAnswer);
		});
	});
});
