export interface SpacedRepetitionItem {
	easeFactor: number;
	intervalDays: number;
	repetitions: number;
	nextReviewDate: string | null;
	lastReviewDate: string | null;
}

export function createInitialItem(): SpacedRepetitionItem {
	return {
		easeFactor: 2.5,
		intervalDays: 1,
		repetitions: 0,
		nextReviewDate: null,
		lastReviewDate: null,
	};
}

export function updateRepetitionItem(
	item: SpacedRepetitionItem,
	quality: number,
): SpacedRepetitionItem {
	const now = new Date();
	const result = { ...item, lastReviewDate: now.toISOString() };

	if (quality >= 3) {
		if (result.repetitions === 0) {
			result.intervalDays = 1;
		} else if (result.repetitions === 1) {
			result.intervalDays = 6;
		} else {
			result.intervalDays = Math.round(result.intervalDays * result.easeFactor);
		}
		result.easeFactor = Math.max(
			1.3,
			result.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
		);
		result.repetitions++;
	} else {
		result.repetitions = 0;
		result.intervalDays = 1;
	}

	const next = new Date(now);
	next.setDate(next.getDate() + result.intervalDays);
	result.nextReviewDate = next.toISOString();

	return result;
}

export function isDueForReview(
	item: SpacedRepetitionItem,
	date?: Date,
): boolean {
	if (item.nextReviewDate === null) {
		return true;
	}
	const now = date ?? new Date();
	return new Date(item.nextReviewDate) <= now;
}
