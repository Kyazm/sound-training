import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AuthGuard } from "./components/auth/AuthGuard";
import { FunctionalHarmony } from "./routes/FunctionalHarmony";
import { Home } from "./routes/Home";
import { Intervals } from "./routes/Intervals";
import { Login } from "./routes/Login";
import { Melody } from "./routes/Melody";
import { Progressions } from "./routes/Progressions";
import { Scales } from "./routes/Scales";
import { Stats } from "./routes/Stats";
import { Voicings } from "./routes/Voicings";
import { useAuthStore } from "./stores/authStore";

export function App() {
	const initialize = useAuthStore((s) => s.initialize);

	useEffect(() => {
		initialize();
	}, [initialize]);

	return (
		<HashRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route
					path="/"
					element={
						<AuthGuard>
							<Home />
						</AuthGuard>
					}
				/>
				<Route
					path="/intervals"
					element={
						<AuthGuard>
							<Intervals />
						</AuthGuard>
					}
				/>
	<Route
					path="/progressions"
					element={
						<AuthGuard>
							<Progressions />
						</AuthGuard>
					}
				/>
				<Route
					path="/scales"
					element={
						<AuthGuard>
							<Scales />
						</AuthGuard>
					}
				/>
				<Route
					path="/melody"
					element={
						<AuthGuard>
							<Melody />
						</AuthGuard>
					}
				/>
				<Route
					path="/voicings"
					element={
						<AuthGuard>
							<Voicings />
						</AuthGuard>
					}
				/>
				<Route
					path="/functional-harmony"
					element={
						<AuthGuard>
							<FunctionalHarmony />
						</AuthGuard>
					}
				/>
				<Route
					path="/stats"
					element={
						<AuthGuard>
							<Stats />
						</AuthGuard>
					}
				/>
			</Routes>
		</HashRouter>
	);
}
