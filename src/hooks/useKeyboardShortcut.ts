import { useEffect } from "react";

const KEY_MAP: Record<string, string> = {
	" ": "space",
	Enter: "enter",
	Escape: "escape",
	"1": "1",
	"2": "2",
	"3": "3",
	"4": "4",
	"5": "5",
	"6": "6",
	"7": "7",
	"8": "8",
	"9": "9",
	Backspace: "backspace",
};

export function useKeyboardShortcut(
	shortcuts: Record<string, () => void>,
): void {
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

			const mapped = KEY_MAP[e.key];
			if (mapped && shortcuts[mapped]) {
				e.preventDefault();
				shortcuts[mapped]();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [shortcuts]);
}
