export interface LevelAdjustment {
	newLevel: number;
	reason: "up" | "down" | "none";
}

export function calculateLevelAdjustment(
	currentLevel: number,
	maxLevel: number,
	recentResults: { isCorrect: boolean }[],
	windowSize = 10,
): LevelAdjustment {
	if (recentResults.length < windowSize) {
		return { newLevel: currentLevel, reason: "none" };
	}

	const window = recentResults.slice(-windowSize);
	const correctCount = window.filter((r) => r.isCorrect).length;
	const accuracy = correctCount / windowSize;

	if (accuracy >= 0.85 && currentLevel < maxLevel) {
		return { newLevel: currentLevel + 1, reason: "up" };
	}

	if (accuracy <= 0.45 && currentLevel > 1) {
		return { newLevel: currentLevel - 1, reason: "down" };
	}

	return { newLevel: currentLevel, reason: "none" };
}
