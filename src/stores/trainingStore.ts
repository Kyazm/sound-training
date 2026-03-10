import { create } from "zustand";
import { calculateLevelAdjustment } from "../lib/training/levelManager";
import {
	generateFunctionalHarmonyQuestion,
	generateIntervalQuestion,
	generateMelodyQuestion,
	generateProgressionQuestion,
	generateScaleQuestion,
	generateVoicingQuestion,
} from "../lib/training/questionGenerator";
import type { NoteName } from "../types/music";
import type { ExerciseRecord, TrainingCategory } from "../types/training";

interface CurrentQuestion {
	prompt: string;
	correctAnswer: string;
	choices: string[];
	audioData: unknown;
}

interface TrainingState {
	category: TrainingCategory | null;
	level: number;
	currentQuestion: CurrentQuestion | null;
	questionIndex: number;
	totalQuestions: number;
	sessionResults: ExerciseRecord[];
	selectedAnswer: string | null;
	showFeedback: boolean;
	sessionComplete: boolean;
	questionStartTime: number;
	fixedRoot: NoteName | undefined;
	startSession: (
		category: TrainingCategory,
		level: number,
		total?: number,
		fixedRoot?: NoteName,
	) => void;
	submitAnswer: (answer: string) => void;
	nextQuestion: () => void;
	endSession: () => void;
	resetSession: () => void;
}

export const DEFAULT_QUESTIONS_PER_SESSION = 5;

export const MAX_LEVELS: Record<string, number> = {
	interval: 5,
	scale: 7,
	progression: 8,
	melody: 6,
	voicing: 7,
	functionalHarmony: 5,
};

const CATEGORY_PROMPTS: Record<string, string> = {
	interval: "この音程は？",
	progression: "この進行は？",
	scale: "このスケールは？",
	voicing: "コードとボイシングを答えてください",
	functionalHarmony: "このコードの機能は？",
	melody: "メロディを聴き取ってください",
};

type QuestionGenerator = (level: number, fixedRoot?: NoteName) => {
	data: unknown;
	correctAnswer: string;
	choices: string[];
	prompt?: string;
};

const GENERATORS: Record<string, QuestionGenerator> = {
	interval: generateIntervalQuestion,
	progression: generateProgressionQuestion,
	scale: generateScaleQuestion,
	melody: generateMelodyQuestion,
	voicing: generateVoicingQuestion,
	functionalHarmony: generateFunctionalHarmonyQuestion,
};

function generateQuestion(
	category: TrainingCategory,
	level: number,
	fixedRoot?: NoteName,
): CurrentQuestion {
	const defaultPrompt = CATEGORY_PROMPTS[category] ?? "聴き取ってください";
	const generator = GENERATORS[category] ?? generateIntervalQuestion;
	const q = generator(level, fixedRoot);
	return {
		prompt: q.prompt ?? defaultPrompt,
		correctAnswer: q.correctAnswer,
		choices: q.choices,
		audioData: q.data,
	};
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
	category: null,
	level: 1,
	currentQuestion: null,
	questionIndex: 0,
	totalQuestions: DEFAULT_QUESTIONS_PER_SESSION,
	sessionResults: [],
	selectedAnswer: null,
	showFeedback: false,
	sessionComplete: false,
	questionStartTime: 0,
	fixedRoot: undefined,

	startSession: (category, level, total = DEFAULT_QUESTIONS_PER_SESSION, fixedRoot?) => {
		const question = generateQuestion(category, level, fixedRoot);
		set({
			category,
			level,
			currentQuestion: question,
			questionIndex: 0,
			totalQuestions: total,
			sessionResults: [],
			selectedAnswer: null,
			showFeedback: false,
			sessionComplete: false,
			questionStartTime: Date.now(),
			fixedRoot,
		});
	},

	submitAnswer: (answer) => {
		const { currentQuestion, category, level, questionStartTime } = get();
		if (!currentQuestion || !category) return;

		const isCorrect = answer === currentQuestion.correctAnswer;
		const responseTimeMs = Date.now() - questionStartTime;

		const record: ExerciseRecord = {
			category,
			subcategory: currentQuestion.correctAnswer,
			level,
			correctAnswer: currentQuestion.correctAnswer,
			userAnswer: answer,
			isCorrect,
			responseTimeMs,
		};

		set((state) => ({
			selectedAnswer: answer,
			showFeedback: true,
			sessionResults: [...state.sessionResults, record],
		}));
	},

	nextQuestion: () => {
		const { category, level, fixedRoot, questionIndex, totalQuestions, sessionResults } =
			get();
		if (!category) return;

		const nextIndex = questionIndex + 1;
		if (nextIndex >= totalQuestions) {
			const maxLevel = MAX_LEVELS[category] ?? 5;
			const adjustment = calculateLevelAdjustment(
				level,
				maxLevel,
				sessionResults,
				totalQuestions,
			);

			set({
				sessionComplete: true,
				level: adjustment.newLevel,
				selectedAnswer: null,
				showFeedback: false,
			});
			return;
		}

		const question = generateQuestion(category, level, fixedRoot);
		set({
			currentQuestion: question,
			questionIndex: nextIndex,
			selectedAnswer: null,
			showFeedback: false,
			questionStartTime: Date.now(),
		});
	},

	endSession: () => {
		set({
			category: null,
			currentQuestion: null,
			questionIndex: 0,
			sessionResults: [],
			selectedAnswer: null,
			showFeedback: false,
			sessionComplete: false,
			questionStartTime: 0,
		});
	},

	resetSession: () => {
		set({
			category: null,
			level: 1,
			currentQuestion: null,
			questionIndex: 0,
			totalQuestions: DEFAULT_QUESTIONS_PER_SESSION,
			sessionResults: [],
			selectedAnswer: null,
			showFeedback: false,
			sessionComplete: false,
			questionStartTime: 0,
		});
	},
}));
