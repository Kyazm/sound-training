export type TrainingCategory =
	| "interval"
	| "progression"
	| "scale"
	| "melody"
	| "voicing"
	| "functionalHarmony";

export type UserRole = "admin" | "player" | "guest";

export interface Question {
	id: string;
	category: TrainingCategory;
	level: number;
	prompt: string;
	correctAnswer: string;
	choices: string[];
	audioData: unknown;
}

export interface SessionResult {
	category: TrainingCategory;
	level: number;
	totalQuestions: number;
	correctCount: number;
	records: ExerciseRecord[];
}

export interface ExerciseRecord {
	category: TrainingCategory;
	subcategory: string;
	level: number;
	correctAnswer: string;
	userAnswer: string;
	isCorrect: boolean;
	responseTimeMs: number;
}
