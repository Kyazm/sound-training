import { useCallback, useEffect, useRef, useState } from "react";
import {
	type ChatMessage,
	buildProgressionSystemPrompt,
	isAIAvailable,
	streamChat,
} from "../../lib/ai/openai";

interface AIChatProps {
	context: {
		key: string;
		mode: string;
		degrees: string[];
		correctAnswer: string;
		userAnswer: string;
		isCorrect: boolean;
		level: number;
	};
}

interface DisplayMessage {
	role: "user" | "assistant";
	content: string;
}

export function AIChat({ context }: AIChatProps) {
	const [messages, setMessages] = useState<DisplayMessage[]>([]);
	const [input, setInput] = useState("");
	const [streaming, setStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const chatHistoryRef = useRef<ChatMessage[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);
	const abortRef = useRef<AbortController | null>(null);
	const initializedRef = useRef(false);

	const scrollToBottom = useCallback(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	// Auto-generate initial explanation
	useEffect(() => {
		if (initializedRef.current || !isAIAvailable()) return;
		initializedRef.current = true;

		const systemMsg = buildProgressionSystemPrompt(context);
		chatHistoryRef.current = [
			systemMsg,
			{ role: "user", content: "この進行について解説してください。" },
		];

		setMessages([]);
		setStreaming(true);
		setError(null);

		let accumulated = "";
		const controller = new AbortController();
		abortRef.current = controller;

		streamChat(
			chatHistoryRef.current,
			(chunk) => {
				accumulated += chunk;
				setMessages([{ role: "assistant", content: accumulated }]);
				scrollToBottom();
			},
			controller.signal,
		)
			.then(() => {
				chatHistoryRef.current.push({
					role: "assistant",
					content: accumulated,
				});
				setStreaming(false);
			})
			.catch((err) => {
				if (err.name !== "AbortError") {
					setError(err.message);
				}
				setStreaming(false);
			});

		return () => {
			controller.abort();
		};
	}, [context, scrollToBottom]);

	const sendMessage = useCallback(async () => {
		const trimmed = input.trim();
		if (!trimmed || streaming) return;

		setInput("");
		setError(null);

		const userMsg: ChatMessage = { role: "user", content: trimmed };
		chatHistoryRef.current.push(userMsg);

		const prevLen = messages.length + 1; // +1 for the user message we're about to add
		setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
		setStreaming(true);

		let accumulated = "";
		const controller = new AbortController();
		abortRef.current = controller;

		try {
			await streamChat(
				chatHistoryRef.current,
				(chunk) => {
					accumulated += chunk;
					setMessages((prev) => {
						// Replace or append the streaming assistant message
						if (prev.length > prevLen) {
							return [...prev.slice(0, prevLen), { role: "assistant", content: accumulated }];
						}
						return [...prev, { role: "assistant", content: accumulated }];
					});
					scrollToBottom();
				},
				controller.signal,
			);

			chatHistoryRef.current.push({
				role: "assistant",
				content: accumulated,
			});
		} catch (err) {
			if (err instanceof Error && err.name !== "AbortError") {
				setError(err.message);
			}
		} finally {
			setStreaming(false);
		}
	}, [input, streaming, scrollToBottom]);

	if (!isAIAvailable()) return null;

	return (
		<div className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800">
			<div className="border-b border-slate-700 px-4 py-2">
				<span className="text-xs font-medium text-slate-400">
					AI 解説
				</span>
			</div>

			<div
				ref={scrollRef}
				className="flex max-h-64 flex-col gap-3 overflow-y-auto px-4 py-3"
			>
				{messages.map((msg, i) => (
					<div
						key={`${msg.role}-${i}`}
						className={
							msg.role === "user"
								? "self-end rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"
								: "whitespace-pre-wrap text-sm leading-relaxed text-slate-300"
						}
					>
						{msg.content}
					</div>
				))}
				{streaming && messages.length === 0 && (
					<p className="text-sm text-slate-500">解説を生成中...</p>
				)}
				{error && (
					<p className="text-sm text-red-400">エラー: {error}</p>
				)}
			</div>

			<div className="border-t border-slate-700 px-3 py-2">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}
					className="flex gap-2"
				>
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="質問を入力..."
						disabled={streaming}
						className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
					/>
					<button
						type="submit"
						disabled={streaming || !input.trim()}
						className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
					>
						送信
					</button>
				</form>
			</div>
		</div>
	);
}
