import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { audioEngine } from "../lib/audio/AudioEngine";
import { useAudioStore } from "../stores/audioStore";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useTrainingStore } from "../stores/trainingStore";
import { useUserStore } from "../stores/userStore";
import type { NoteName } from "../types/music";
import type { TrainingCategory } from "../types/training";

interface TrainingSessionConfig {
	category: TrainingCategory;
	fixedRootOverride?: NoteName;
	onNextExtra?: () => void;
}

export function useTrainingSession(config: TrainingSessionConfig) {
	const { category, fixedRootOverride, onNextExtra } = config;

	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const role = useAuthStore((s) => s.role);
	const { initialize: initAudio, isPlaying, setPlaying } = useAudioStore();
	const { fixedKey, fixedKeyRoot, adminLevelOverrides, levelOverrides } =
		useSettingsStore();
	const categoryProgress = useUserStore((s) => s.categoryProgress);
	const { fetchCategoryProgress, addXP, updateCategoryProgress, saveExerciseRecords } =
		useUserStore();
	const storeCategory = useTrainingStore((s) => s.category);
	const {
		level,
		currentQuestion: rawQuestion,
		questionIndex,
		totalQuestions,
		sessionResults,
		selectedAnswer,
		showFeedback,
		sessionComplete,
		startSession,
		submitAnswer,
		nextQuestion,
		resetSession,
	} = useTrainingStore();

	// Stale guard: suppress question from previous category until effect initializes this session
	const currentQuestion = storeCategory === category ? rawQuestion : null;

	const [replayed, setReplayed] = useState(false);
	const sessionSaved = useRef(false);

	const isGuest = role === "guest";
	const isAdmin = role === "admin";

	const progressLevel =
		categoryProgress[category]?.currentLevel ?? 1;

	const currentLevel = isAdmin
		? (adminLevelOverrides[category] ?? progressLevel)
		: (levelOverrides[category] ?? (isGuest ? 1 : progressLevel));

	const resolvedFixedRoot = fixedRootOverride ?? (fixedKey ? fixedKeyRoot : undefined);

	useEffect(() => {
		if (user) fetchCategoryProgress(user.id);
	}, [user, fetchCategoryProgress]);

	useEffect(() => {
		resetSession();
		startSession(category, currentLevel, undefined, resolvedFixedRoot);
		sessionSaved.current = false;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (sessionComplete && !sessionSaved.current && user && !isGuest) {
			sessionSaved.current = true;
			const correct = sessionResults.filter((r) => r.isCorrect).length;
			addXP(correct * 10);
			updateCategoryProgress(category, correct, sessionResults.length, level);
			saveExerciseRecords(sessionResults);
		}
	}, [sessionComplete, user, isGuest, sessionResults, level, category, addXP, updateCategoryProgress, saveExerciseRecords]);

	const stopPlayback = useCallback(() => {
		audioEngine.stop();
		setPlaying(false);
	}, [setPlaying]);

	const handleSelect = useCallback(
		(answer: string) => {
			if (showFeedback) return;
			submitAnswer(answer);
		},
		[showFeedback, submitAnswer],
	);

	const handleNext = useCallback(() => {
		setReplayed(false);
		onNextExtra?.();
		nextQuestion();
	}, [nextQuestion, onNextExtra]);

	const handleRetry = useCallback(() => {
		setReplayed(false);
		onNextExtra?.();
		resetSession();
		startSession(category, currentLevel, undefined, resolvedFixedRoot);
	}, [resetSession, startSession, category, currentLevel, resolvedFixedRoot, onNextExtra]);

	const handleHome = useCallback(() => {
		resetSession();
		navigate("/");
	}, [resetSession, navigate]);

	const correctCount = sessionResults.filter((r) => r.isCorrect).length;

	const choiceShortcuts = useMemo(
		() =>
			Object.fromEntries(
				(currentQuestion?.choices ?? []).map((c, i) => [
					String(i + 1),
					() => handleSelect(c),
				]),
			),
		[currentQuestion, handleSelect],
	);

	return {
		level,
		currentQuestion,
		questionIndex,
		totalQuestions,
		sessionResults,
		selectedAnswer,
		showFeedback,
		sessionComplete,
		isPlaying,
		correctCount,
		replayed,
		initAudio,
		setPlaying,
		setReplayed,
		stopPlayback,
		handleSelect,
		handleNext,
		handleRetry,
		handleHome,
		submitAnswer,
		choiceShortcuts,
	};
}
