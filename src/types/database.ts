interface ProfileRow {
	id: string;
	display_name: string | null;
	level: number;
	total_xp: number;
	current_streak: number;
	longest_streak: number;
	last_practice_date: string | null;
	settings: UserSettings;
	role: string;
	created_at: string;
}

interface CategoryProgressRow {
	id: string;
	user_id: string;
	category: string;
	current_level: number;
	total_correct: number;
	total_attempts: number;
	updated_at: string;
}

interface ExerciseRecordRow {
	id: string;
	user_id: string;
	category: string;
	subcategory: string | null;
	level: number;
	question: unknown;
	correct_answer: string;
	user_answer: string;
	is_correct: boolean;
	response_time_ms: number;
	created_at: string;
}

interface SpacedRepetitionItemRow {
	id: string;
	user_id: string;
	category: string;
	item_key: string;
	ease_factor: number;
	interval_days: number;
	repetitions: number;
	next_review_date: string | null;
	last_review_date: string | null;
}

export interface Database {
	public: {
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		Tables: {
			profiles: {
				Row: ProfileRow;
				Insert: Omit<ProfileRow, "created_at">;
				Update: Partial<Omit<ProfileRow, "created_at">>;
				Relationships: [];
			};
			category_progress: {
				Row: CategoryProgressRow;
				Insert: Omit<CategoryProgressRow, "id" | "updated_at">;
				Update: Partial<Omit<CategoryProgressRow, "id" | "updated_at">>;
				Relationships: [];
			};
			exercise_records: {
				Row: ExerciseRecordRow;
				Insert: Omit<ExerciseRecordRow, "id" | "created_at">;
				Update: Partial<Omit<ExerciseRecordRow, "id" | "created_at">>;
				Relationships: [];
			};
			spaced_repetition_items: {
				Row: SpacedRepetitionItemRow;
				Insert: Omit<SpacedRepetitionItemRow, "id">;
				Update: Partial<Omit<SpacedRepetitionItemRow, "id">>;
				Relationships: [];
			};
		};
	};
}

export interface UserSettings {
	playbackSpeed: number;
	fixedKey: string | null;
	darkMode: boolean;
}
