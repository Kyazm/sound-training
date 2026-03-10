import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export function AuthGuard({ children }: { children: ReactNode }) {
	const { user, role, loading } = useAuthStore();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-900">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
			</div>
		);
	}

	if (!user && role !== "guest") {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}
