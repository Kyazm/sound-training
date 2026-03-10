import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANT_CLASSES = {
	primary: "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white",
	secondary: "bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white",
	success:
		"bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white",
	danger: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white",
} as const;

const SIZE_CLASSES = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-lg",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof VARIANT_CLASSES;
	size?: keyof typeof SIZE_CLASSES;
	fullWidth?: boolean;
	children: ReactNode;
}

export function Button({
	variant = "primary",
	size = "md",
	fullWidth = false,
	disabled,
	className = "",
	children,
	...rest
}: ButtonProps) {
	return (
		<button
			disabled={disabled}
			className={`
				rounded-lg font-medium transition-colors duration-150
				${VARIANT_CLASSES[variant]}
				${SIZE_CLASSES[size]}
				${fullWidth ? "w-full" : ""}
				${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
				${className}
			`}
			{...rest}
		>
			{children}
		</button>
	);
}
