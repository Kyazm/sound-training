import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuthStore } from "../stores/authStore";
import { DEFAULT_QUESTIONS_PER_SESSION, MAX_LEVELS } from "../stores/trainingStore";
import { useUserStore } from "../stores/userStore";
import type { TrainingCategory } from "../types/training";

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
	interval: "インターバル",
	progression: "コード進行",
	scale: "スケール",
	melody: "メロディ",
	voicing: "コード & ボイシング",
	functionalHarmony: "機能和声",
};

const CATEGORY_PATHS: Record<TrainingCategory, string> = {
	interval: "/intervals",
	progression: "/progressions",
	scale: "/scales",
	melody: "/melody",
	voicing: "/voicings",
	functionalHarmony: "/functional-harmony",
};

const CATEGORY_COLORS: Record<
	TrainingCategory,
	"indigo" | "emerald" | "amber"
> = {
	interval: "indigo",
	progression: "amber",
	scale: "indigo",
	melody: "emerald",
	voicing: "emerald",
	functionalHarmony: "indigo",
};

const ALL_CATEGORIES: TrainingCategory[] = [
	"interval",
	"progression",
	"scale",
	"melody",
	"voicing",
	"functionalHarmony",
];

export function Stats() {
	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const role = useAuthStore((s) => s.role);
	const {
		profile,
		categoryProgress,
		levelStats,
		wrongAnswers,
		loading,
		fetchProfile,
		fetchCategoryProgress,
		fetchLevelStats,
		fetchWrongAnswers,
	} = useUserStore();

	const [expandedCat, setExpandedCat] = useState<TrainingCategory | null>(null);

	useEffect(() => {
		if (user) {
			fetchProfile(user.id);
			fetchCategoryProgress(user.id);
			fetchLevelStats(user.id);
			fetchWrongAnswers(user.id);
		}
	}, [user, fetchProfile, fetchCategoryProgress, fetchLevelStats, fetchWrongAnswers]);

	if (role === "guest") {
		return <Navigate to="/" replace />;
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-900">
				<p className="text-slate-400">読み込み中...</p>
			</div>
		);
	}

	const totalCorrect = ALL_CATEGORIES.reduce(
		(sum, cat) => sum + (categoryProgress[cat]?.totalCorrect ?? 0),
		0,
	);
	const totalAttempts = ALL_CATEGORIES.reduce(
		(sum, cat) => sum + (categoryProgress[cat]?.totalAttempts ?? 0),
		0,
	);
	const overallAccuracy =
		totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

	const wrongByCategory = ALL_CATEGORIES.reduce(
		(acc, cat) => {
			acc[cat] = wrongAnswers.filter((w) => w.category === cat);
			return acc;
		},
		{} as Record<TrainingCategory, typeof wrongAnswers>,
	);

	return (
		<div className="min-h-screen bg-slate-900 px-4 py-6">
			<div className="mx-auto max-w-2xl">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-2xl font-bold text-white">統計</h1>
					<Button variant="secondary" size="sm" onClick={() => navigate("/")}>
						ホームに戻る
					</Button>
				</div>

				{/* Overview */}
				<div className="grid gap-4 sm:grid-cols-2">
					<Card>
						<p className="text-sm text-slate-400">全体正解率</p>
						<p className="mt-1 text-3xl font-bold text-emerald-400">
							{overallAccuracy}%
						</p>
						<p className="mt-1 text-xs text-slate-500">
							{totalCorrect} / {totalAttempts} 問
						</p>
					</Card>

					<Card>
						<p className="text-sm text-slate-400">レベル / XP</p>
						<p className="mt-1 text-3xl font-bold text-indigo-400">
							Lv.{profile?.level ?? 1}
						</p>
						<p className="mt-1 text-xs text-slate-500">
							{profile?.totalXP ?? 0} XP
						</p>
					</Card>

					<Card>
						<p className="text-sm text-slate-400">連続練習日数</p>
						<p className="mt-1 text-3xl font-bold text-amber-400">
							{profile?.currentStreak ?? 0}日
						</p>
						<p className="mt-1 text-xs text-slate-500">
							最長: {profile?.longestStreak ?? 0}日
						</p>
					</Card>

					<Card>
						<p className="text-sm text-slate-400">総セッション数</p>
						<p className="mt-1 text-3xl font-bold text-white">
							{totalAttempts > 0 ? Math.ceil(totalAttempts / DEFAULT_QUESTIONS_PER_SESSION) : 0}
						</p>
					</Card>
				</div>

				{/* Per-category detailed stats */}
				<Card title="カテゴリ別成績" className="mt-6">
					<div className="flex flex-col gap-4">
						{ALL_CATEGORIES.map((cat) => {
							const progress = categoryProgress[cat];
							const correct = progress?.totalCorrect ?? 0;
							const attempts = progress?.totalAttempts ?? 0;
							const accuracy =
								attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
							const isExpanded = expandedCat === cat;
							const maxLevel = MAX_LEVELS[cat] ?? 5;
							const catLevelStats = levelStats[cat] ?? {};
							const wrongCount = wrongByCategory[cat]?.length ?? 0;

							return (
								<div key={cat}>
									<button
										type="button"
										onClick={() => setExpandedCat(isExpanded ? null : cat)}
										className="mb-1 flex w-full items-center justify-between text-left"
									>
										<span className="text-sm font-medium text-slate-200">
											{CATEGORY_LABELS[cat]}
											{wrongCount > 0 && (
												<span className="ml-2 rounded bg-red-900/50 px-1.5 py-0.5 text-xs text-red-400">
													{wrongCount}問 誤答
												</span>
											)}
										</span>
										<span className="flex items-center gap-2 text-xs text-slate-400">
											Lv.{progress?.currentLevel ?? 1} | {correct}/{attempts}
											<span className="text-slate-600">{isExpanded ? "▲" : "▼"}</span>
										</span>
									</button>
									<ProgressBar value={accuracy} color={CATEGORY_COLORS[cat]} />

									{isExpanded && (
										<div className="mt-2 space-y-1 rounded-lg bg-slate-800/50 p-3">
											<p className="mb-2 text-xs font-semibold text-slate-400">レベル別成績</p>
											{Array.from({ length: maxLevel }, (_, i) => i + 1).map((lv) => {
												const lvStats = catLevelStats[lv];
												const lvCorrect = lvStats?.correct ?? 0;
												const lvAttempts = lvStats?.attempts ?? 0;
												const lvAccuracy = lvAttempts > 0
													? Math.round((lvCorrect / lvAttempts) * 100)
													: 0;

												return (
													<div key={lv} className="flex items-center gap-3">
														<span className="w-10 text-xs text-slate-500">Lv.{lv}</span>
														<div className="flex-1">
															<div className="h-2 overflow-hidden rounded-full bg-slate-700">
																<div
																	className="h-full rounded-full bg-indigo-500 transition-all"
																	style={{ width: `${lvAccuracy}%` }}
																/>
															</div>
														</div>
														<span className="w-20 text-right text-xs text-slate-500">
															{lvAttempts > 0 ? `${lvCorrect}/${lvAttempts} (${lvAccuracy}%)` : "—"}
														</span>
													</div>
												);
											})}

											{wrongCount > 0 && (
												<div className="mt-3 border-t border-slate-700 pt-3">
													<div className="mb-2 flex items-center justify-between">
														<p className="text-xs font-semibold text-red-400">誤答リスト</p>
														<button
															type="button"
															onClick={() => navigate(CATEGORY_PATHS[cat])}
															className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
														>
															復習する
														</button>
													</div>
													<div className="space-y-1">
														{wrongByCategory[cat].slice(0, 10).map((w) => (
															<div
																key={`${w.correctAnswer}-${w.createdAt}`}
																className="flex items-center justify-between text-xs"
															>
																<span className="text-slate-300">
																	正解: <span className="font-mono text-emerald-400">{w.correctAnswer}</span>
																</span>
																<span className="text-slate-500">
																	回答: <span className="font-mono text-red-400">{w.userAnswer}</span>
																	<span className="ml-2 text-slate-600">Lv.{w.level}</span>
																</span>
															</div>
														))}
														{wrongCount > 10 && (
															<p className="text-xs text-slate-600">
																...他 {wrongCount - 10} 件
															</p>
														)}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</Card>
			</div>
		</div>
	);
}
