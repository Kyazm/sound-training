import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import type { UserRole } from "../types/training";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

async function fetchRole(userId: string): Promise<UserRole> {
	const { data } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", userId)
		.single();
	const row = data as Record<string, unknown> | null;
	return (row?.role as UserRole) ?? "player";
}

interface AuthState {
	user: User | null;
	role: UserRole;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	signInAsGuest: () => void;
	initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	role: "player",
	loading: true,

	signIn: async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;

		if (data.user) {
			const role = await fetchRole(data.user.id);
			set({ role });
		}
	},

	signUp: async (email, password) => {
		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) throw error;

		if (data.user) {
			const profile: ProfileInsert = {
				id: data.user.id,
				display_name: null,
				level: 1,
				total_xp: 0,
				current_streak: 0,
				longest_streak: 0,
				last_practice_date: null,
				settings: {
					playbackSpeed: 1,
					fixedKey: null,
					darkMode: true,
				},
				role: "player",
			};
			const { error: profileError } = await supabase
				.from("profiles")
				.insert(profile as never);
			if (profileError) throw profileError;
			set({ role: "player" });
		}
	},

	signOut: async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		set({ user: null, role: "player" });
	},

	signInAsGuest: () => {
		set({ user: null, role: "guest", loading: false });
	},

	initialize: async () => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const user = session?.user ?? null;

		const role: UserRole = user ? await fetchRole(user.id) : "player";
		set({ user, role, loading: false });

		supabase.auth.onAuthStateChange(async (_event, session) => {
			const u = session?.user ?? null;
			if (u) {
				const r = await fetchRole(u.id);
				set({ user: u, role: r });
			} else {
				const currentRole = useAuthStore.getState().role;
				if (currentRole !== "guest") {
					set({ user: null, role: "player" });
				}
			}
		});
	},
}));
