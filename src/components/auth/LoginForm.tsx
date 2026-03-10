import { type FormEvent, useState } from "react";
import { useAuthStore } from "../../stores/authStore";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const { signIn, signUp, signInAsGuest } = useAuthStore();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);

		try {
			if (isSignUp) {
				await signUp(email, password);
			} else {
				await signIn(email, password);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "エラーが発生しました");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight text-white">
						Sound Training
					</h1>
					<p className="mt-2 text-slate-400">
						{isSignUp ? "アカウントを作成" : "ログイン"}
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-6 rounded-xl bg-slate-800 p-8 shadow-xl"
				>
					{error && (
						<div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-300">
							{error}
						</div>
					)}

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-slate-300"
						>
							メールアドレス
						</label>
						<input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							placeholder="example@mail.com"
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-slate-300"
						>
							パスワード
						</label>
						<input
							id="password"
							type="password"
							required
							minLength={6}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							placeholder="6文字以上"
						/>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{submitting ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
					</button>

					<div className="text-center">
						<button
							type="button"
							onClick={() => {
								setIsSignUp(!isSignUp);
								setError(null);
							}}
							className="text-sm text-indigo-400 hover:text-indigo-300"
						>
							{isSignUp ? "アカウントをお持ちの方はこちら" : "新規登録はこちら"}
						</button>
					</div>
				</form>

				<div className="text-center">
					<button
						type="button"
						onClick={signInAsGuest}
						className="rounded-lg border border-slate-600 px-6 py-2.5 text-sm text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
					>
						ゲストとして試す
					</button>
					<p className="mt-2 text-xs text-slate-500">
						Lv.1のみ体験可能・統計は保存されません
					</p>
				</div>
			</div>
		</div>
	);
}
