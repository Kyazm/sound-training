const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as
	| string
	| undefined;

export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export function isAIAvailable(): boolean {
	return !!OPENAI_API_KEY;
}

export async function streamChat(
	messages: ChatMessage[],
	onChunk: (text: string) => void,
	signal?: AbortSignal,
): Promise<void> {
	if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

	const res = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			messages,
			stream: true,
			max_tokens: 1024,
		}),
		signal,
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`OpenAI API error: ${res.status} ${err}`);
	}

	const reader = res.body?.getReader();
	if (!reader) throw new Error("No response body");

	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed.startsWith("data: ")) continue;
			const data = trimmed.slice(6);
			if (data === "[DONE]") return;

			try {
				const parsed = JSON.parse(data);
				const content = parsed.choices?.[0]?.delta?.content;
				if (content) onChunk(content);
			} catch {
				// skip malformed JSON
			}
		}
	}
}

export function buildProgressionSystemPrompt(context: {
	key: string;
	mode: string;
	degrees: string[];
	correctAnswer: string;
	userAnswer: string;
	isCorrect: boolean;
	level: number;
}): ChatMessage {
	return {
		role: "system",
		content: `あなたはジャズ音楽理論の専門家です。ユーザーがコード進行の聴音トレーニングをしています。
以下のコンテキストに基づいて、簡潔で実践的な解説を日本語で行ってください。
音楽用語（コード名、スケール名等）は英語表記を使ってください。

## コンテキスト
- Key: ${context.key} ${context.mode}
- コード進行: ${context.degrees.join(" - ")}
- 正解: ${context.correctAnswer}
- ユーザーの回答: ${context.userAnswer}
- 正誤: ${context.isCorrect ? "正解" : "不正解"}
- レベル: ${context.level}

## 初回解説の指針
- この進行の特徴や使われ方を2-3文で解説
- 各コードの機能（T/SD/D）を簡潔に示す
- 有名な使用例があれば1つ挙げる
- ユーザーが不正解の場合、正解との聴き分けポイントを教える

## フォローアップの指針
- ユーザーの質問に端的に答える
- 具体的なスケールやボイシングの提案は歓迎
- 練習方法のアドバイスも可`,
	};
}
