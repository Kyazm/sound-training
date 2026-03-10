import type { ReactNode } from "react";

interface CardProps {
	title?: string;
	className?: string;
	children: ReactNode;
}

export function Card({ title, className = "", children }: CardProps) {
	return (
		<div className={`rounded-xl bg-slate-800 p-6 ${className}`}>
			{title && (
				<h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
			)}
			{children}
		</div>
	);
}
