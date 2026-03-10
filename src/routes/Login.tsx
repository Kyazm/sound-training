import { Navigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuthStore } from "../stores/authStore";

export function Login() {
	const { user, role } = useAuthStore();

	if (user || role === "guest") {
		return <Navigate to="/" replace />;
	}

	return <LoginForm />;
}
