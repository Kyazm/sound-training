import { useEffect } from "react";
import { Link } from "react-router-dom";
import { NOTE_NAMES } from "../lib/music/notes";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";
import { MAX_LEVELS } from "../stores/trainingStore";
import { useUserStore } from "../stores/userStore";
import type { NoteName } from "../types/music";
import {
	ALL_CATEGORIES,
	CATEGORY_DESCRIPTIONS,
	CATEGORY_LABELS,
	CATEGORY_PATHS,
} from "../types/training";

export function Home() {
	const user = useAuthStore((s) => s.user);
	const role = useAuthStore((s) => s.role);
	const signOut = useAuthStore((s) => s.signOut);
	const { profile, categoryProgress, fetchProfile, fetchCategoryProgress } =
		useUserStore();
	const {
		fixedKey,
		fixedKeyRoot,
		adminLevelOverrides,
		levelOverrides,
		setFixedKey,
		setFixedKeyRoot,
		setAdminLevel,
		setLevelOverride,
	} = useSettingsStore();

	const isGuest = role === "guest";
	const isAdmin = role === "admin";

	useEffect(() => {
		if (user) {
			fetchProfile(user.id);
			fetchCategoryProgress(user.id);
		}
	}, [user, fetchProfile, fetchCategoryProgress]);

	const handleSignOut = () => {
		if (isGuest) {
			useAuthStore.setState({ role: "player", loading: false });
		} else {
			signOut();
		}
	};

	return (
		<div className="min-h-screen bg-slate-900">
			<header className="border-b border-slate-700 bg-slate-800">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
					<h1 className="text-2xl font-bold text-white">Sound Training</h1>
					<div className="flex items-center gap-4">
						{isGuest && (
							<span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
								ゲスト
							</span>
						)}
						{isAdmin && (
							<span className="rounded-full bg-amber-600 px-3 py-1 text-xs text-white">
								Admin
							</span>
						)}
						{!isGuest && profile && (
							<div className="flex items-center gap-3 text-sm">
								<span className="text-indigo-400">Lv.{profile.level}</span>
								<span className="text-slate-400">{profile.totalXP} XP</span>
								{profile.currentStreak > 0 && (
									<span className="text-amber-400">
										{profile.currentStreak}日連続
									</span>
								)}
							</div>
						)}
						<button
							type="button"
							onClick={handleSignOut}
							className="rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
						>
							{isGuest ? "ログインへ" : "ログアウト"}
						</button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-8">
				<div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
					<label className="flex items-center gap-2 text-sm text-slate-300">
						<input
							type="checkbox"
							checked={fixedKey}
							onChange={(e) => setFixedKey(e.target.checked)}
							className="h-4 w-4 rounded border-slate-600 bg-slate-700 accent-indigo-500"
						/>
						Key固定
					</label>
					{fixedKey && (
						<select
							value={fixedKeyRoot}
							onChange={(e) => setFixedKeyRoot(e.target.value as NoteName)}
							className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1 text-sm text-white"
						>
							{NOTE_NAMES.map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					)}
					{fixedKey && (
						<span className="text-xs text-slate-500">
							全ての問題のルートを {fixedKeyRoot} に固定します
						</span>
					)}
				</div>

				<h2 className="mb-6 text-xl font-semibold text-slate-200">
					トレーニングを選択
				</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{ALL_CATEGORIES.map((category) => {
						const label = CATEGORY_LABELS[category];
						const description = CATEGORY_DESCRIPTIONS[category];
						const path = CATEGORY_PATHS[category];
						const progress = categoryProgress[category];
						const lvl = progress?.currentLevel ?? 1;
						const attempts = progress?.totalAttempts ?? 0;
						const correct = progress?.totalCorrect ?? 0;
						const accuracy =
							attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
						const maxLevel = MAX_LEVELS[category] ?? 5;
						return (
							<Link
								key={category}
								to={path}
								className="group rounded-xl border border-slate-700 bg-slate-800 p-6 transition-colors hover:border-indigo-500 hover:bg-slate-750"
							>
								<h3 className="text-lg font-semibold text-white group-hover:text-indigo-400">
									{label}
								</h3>
								<p className="mt-1 text-sm text-slate-400">{description}</p>
								<div className="mt-4 flex items-center justify-between text-xs text-slate-500">
									{(() => {
										const selectable = isAdmin
											? maxLevel
											: Math.min(3, maxLevel);
										const overrideValue = isAdmin
											? (adminLevelOverrides[category] ?? lvl)
											: (levelOverrides[category] ?? lvl);
										const setLevel = isAdmin ? setAdminLevel : setLevelOverride;
										return (
											<span
												onClick={(e) => e.preventDefault()}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ")
														e.preventDefault();
												}}
												className="flex items-center gap-1"
											>
												Lv.
												<select
													value={overrideValue}
													onChange={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setLevel(category, Number(e.target.value));
													}}
													onClick={(e) => e.preventDefault()}
													onKeyDown={(e) => e.stopPropagation()}
													className="rounded border border-slate-600 bg-slate-700 px-1 py-0.5 text-xs text-white"
												>
													{Array.from(
														{ length: selectable },
														(_, i) => i + 1,
													).map((l) => (
														<option key={l} value={l}>
															{l}
														</option>
													))}
												</select>
											</span>
										);
									})()}
									{attempts > 0 && (
										<span className="text-emerald-500">{accuracy}% 正解</span>
									)}
								</div>
							</Link>
						);
					})}
				</div>

				{!isGuest && (
					<div className="mt-8">
						<Link
							to="/stats"
							className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
						>
							統計を見る
						</Link>
					</div>
				)}
			</main>
		</div>
	);
}
