import type {
	ChordQuality,
	FunctionalCategory,
	Key,
	NoteName,
	ScaleDegree,
} from "../../types/music";
import { getChordInKey } from "./chords";

export const FUNCTIONAL_DISPLAY_NAMES: Record<FunctionalCategory, string> = {
	tonic: "Tonic (T)",
	subdominant: "Subdominant (SD)",
	dominant: "Dominant (D)",
};

const DEGREE_FUNCTIONS: Record<string, FunctionalCategory> = {
	I: "tonic",
	iii: "tonic",
	vi: "tonic",
	IV: "subdominant",
	ii: "subdominant",
	V: "dominant",
	vii: "dominant",
	bVII: "dominant",
	bII: "dominant",
	II7: "dominant",
	III7: "dominant",
	VI7: "dominant",
};

export function getChordFunction(degree: ScaleDegree): FunctionalCategory {
	return DEGREE_FUNCTIONS[degree] ?? "tonic";
}

export interface FunctionalHarmonyQuestion {
	key: Key;
	degree: ScaleDegree;
	chordRoot: NoteName;
	chordQuality: ChordQuality;
	chordNotes: NoteName[];
	correctFunction: FunctionalCategory;
	/** Cadence chords to establish key context (I-V-I) */
	contextChords: { root: NoteName; quality: ChordQuality; notes: NoteName[] }[];
	/** For Lv.4-5: short progression with target index */
	progressionContext?: {
		degrees: ScaleDegree[];
		chords: { root: NoteName; quality: ChordQuality; notes: NoteName[] }[];
		targetIndex: number;
	};
}

// Levels define which degrees to test AND the context format
export const FUNCTIONAL_LEVELS: Record<number, {
	degrees: ScaleDegree[];
	/** "cadence" = play I-V-I then target; "progression" = play short progression, ask about one chord */
	mode: "cadence" | "progression";
}> = {
	1: { degrees: ["I", "IV", "V"], mode: "cadence" },
	2: { degrees: ["I", "ii", "IV", "V", "vi"], mode: "cadence" },
	3: { degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii"], mode: "cadence" },
	4: { degrees: ["I", "ii", "IV", "V", "vi", "II7", "III7", "VI7"], mode: "progression" },
	5: {
		degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii", "bII", "bVII", "II7", "III7", "VI7"],
		mode: "progression",
	},
};

// Short progressions where one chord is the "target" to identify
const PROGRESSION_TEMPLATES: { degrees: ScaleDegree[]; targetIndex: number }[] = [
	{ degrees: ["I", "IV", "V", "I"], targetIndex: 1 },    // target = IV (SD)
	{ degrees: ["ii", "V", "I"], targetIndex: 0 },          // target = ii (SD)
	{ degrees: ["I", "vi", "IV", "V"], targetIndex: 2 },    // target = IV (SD)
	{ degrees: ["I", "vi", "ii", "V"], targetIndex: 3 },    // target = V (D)
	{ degrees: ["I", "iii", "vi", "V"], targetIndex: 1 },   // target = iii (T)
	{ degrees: ["ii", "V", "I", "vi"], targetIndex: 2 },    // target = I (T)
	{ degrees: ["I", "II7", "ii", "V"], targetIndex: 1 },   // target = II7 (D)
	{ degrees: ["I", "VI7", "ii", "V"], targetIndex: 1 },   // target = VI7 (D)
];

export function generateFunctionalQuestion(
	key: Key,
	degree: ScaleDegree,
	mode: "cadence" | "progression",
): FunctionalHarmonyQuestion {
	const chord = getChordInKey(key, degree);

	// Build I-V-I cadence for key context
	const iChord = getChordInKey(key, "I");
	const vChord = getChordInKey(key, "V");
	const contextChords = [
		{ root: iChord.root, quality: iChord.quality, notes: iChord.notes },
		{ root: vChord.root, quality: vChord.quality, notes: vChord.notes },
		{ root: iChord.root, quality: iChord.quality, notes: iChord.notes },
	];

	const base: FunctionalHarmonyQuestion = {
		key,
		degree,
		chordRoot: chord.root,
		chordQuality: chord.quality,
		chordNotes: chord.notes,
		correctFunction: getChordFunction(degree),
		contextChords,
	};

	if (mode === "progression") {
		// Pick a random template that contains the target degree's function
		const targetFunction = getChordFunction(degree);
		const matching = PROGRESSION_TEMPLATES.filter(
			(t) => getChordFunction(t.degrees[t.targetIndex]) === targetFunction,
		);
		const template = matching.length > 0
			? matching[Math.floor(Math.random() * matching.length)]
			: PROGRESSION_TEMPLATES[0];

		const progChords = template.degrees.map((d) => {
			const c = getChordInKey(key, d);
			return { root: c.root, quality: c.quality, notes: c.notes };
		});

		base.progressionContext = {
			degrees: template.degrees,
			chords: progChords,
			targetIndex: template.targetIndex,
		};
		// Override answer to match the actual target in the progression
		const actualTargetDegree = template.degrees[template.targetIndex];
		base.degree = actualTargetDegree;
		base.correctFunction = getChordFunction(actualTargetDegree);
		const targetChord = progChords[template.targetIndex];
		base.chordRoot = targetChord.root;
		base.chordQuality = targetChord.quality;
		base.chordNotes = targetChord.notes;
	}

	return base;
}
