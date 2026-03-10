export type TrainingCategory =
	| "interval"
	| "progression"
	| "scale"
	| "melody"
	| "voicing"
	| "functionalHarmony";

export const ALL_CATEGORIES: TrainingCategory[] = [
	"interval",
	"progression",
	"scale",
	"melody",
	"voicing",
	"functionalHarmony",
];

export const CATEGORY_LABELS: Record<TrainingCategory, string> = {
	interval: "インターバル",
	progression: "コード進行",
	scale: "スケール",
	melody: "メロディ",
	voicing: "コード & ボイシング",
	functionalHarmony: "機能和声",
};

export const CATEGORY_PATHS: Record<TrainingCategory, string> = {
	interval: "/intervals",
	progression: "/progressions",
	scale: "/scales",
	melody: "/melody",
	voicing: "/voicings",
	functionalHarmony: "/functional-harmony",
};

export const CATEGORY_DESCRIPTIONS: Record<TrainingCategory, string> = {
	interval: "2音間の音程を聴き取る",
	progression: "ii-V-I等の進行を識別する",
	scale: "スケールの種類を聴き取る",
	melody: "メロディを聴き取って再現する",
	voicing: "コードの種類とボイシングを聴き分ける",
	functionalHarmony: "T/SD/Dの機能を判定する",
};

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
