import type { ChordInfo, Key, ScaleDegree } from "../../types/music";
import { getChordInKey } from "./chords";

export interface ProgressionPattern {
	name: string;
	degrees: ScaleDegree[];
	level: number;
}

export const PROGRESSION_PATTERNS: ProgressionPattern[] = [
	// Level 1: Basic diatonic
	{ name: "I-IV-V-I", degrees: ["I", "IV", "V", "I"], level: 1 },
	{ name: "I-V-VI-IV", degrees: ["I", "V", "vi", "IV"], level: 1 },
	{ name: "I-IV-VI-V", degrees: ["I", "IV", "vi", "V"], level: 1 },
	{ name: "I-VI-IV-V", degrees: ["I", "vi", "IV", "V"], level: 1 },

	// Level 2: More diatonic movement
	{ name: "II-V-I-VI", degrees: ["ii", "V", "I", "vi"], level: 2 },
	{ name: "I-VI-II-V", degrees: ["I", "vi", "ii", "V"], level: 2 },
	{ name: "III-VI-II-V", degrees: ["iii", "vi", "ii", "V"], level: 2 },
	{ name: "I-II-III-IV", degrees: ["I", "ii", "iii", "IV"], level: 2 },

	// Level 3: Extended diatonic
	{
		name: "I-IV-VII-III-VI-II-V-I",
		degrees: ["I", "IV", "vii", "iii", "vi", "ii", "V", "I"],
		level: 3,
	},
	{ name: "VI-II-V-I", degrees: ["vi", "ii", "V", "I"], level: 3 },
	{ name: "I-VII-III-VI", degrees: ["I", "vii", "iii", "vi"], level: 3 },
	{ name: "II-V-I-IV", degrees: ["ii", "V", "I", "IV"], level: 3 },

	// Level 4: Secondary dominants
	{ name: "I-VI7-II-V", degrees: ["I", "VI7", "ii", "V"], level: 4 },
	{ name: "I-II7-II-V", degrees: ["I", "II7", "ii", "V"], level: 4 },
	{ name: "I-III7-VI-V", degrees: ["I", "III7", "vi", "V"], level: 4 },
	{
		name: "II-V-I-VI7-II-V",
		degrees: ["ii", "V", "I", "VI7", "ii", "V"],
		level: 4,
	},

	// Level 5: Tritone substitution
	{ name: "II-bII-I-V", degrees: ["ii", "bII", "I", "V"], level: 5 },
	{ name: "I-bVII-bVI-V", degrees: ["I", "bVII", "bVI", "V"], level: 5 },
	{ name: "II-V-bII-I", degrees: ["ii", "V", "bII", "I"], level: 5 },
	{ name: "I-bII-I-V", degrees: ["I", "bII", "I", "V"], level: 5 },

	// Level 6: Advanced jazz
	{ name: "I-#IVdim7-V-I", degrees: ["I", "#IVdim7", "V", "I"], level: 6 },
	{
		name: "III-bIII-II-bII-I",
		degrees: ["iii", "bIII", "ii", "bII", "I"],
		level: 6,
	},
	{ name: "I-bVI-bII-V", degrees: ["I", "bVI", "bII", "V"], level: 6 },
	{ name: "VI-bVI-V-bV-IV", degrees: ["vi", "bVI", "V", "bV", "IV"], level: 6 },

	// Level 6 additions: Standard jazz forms
	{
		name: "Autumn Leaves (A)",
		degrees: ["ii", "V", "I", "IV", "vii", "III7", "vi", "vi"],
		level: 6,
	},
	{
		name: "Rhythm Changes (A)",
		degrees: ["I", "vi", "ii", "V", "I", "vi", "ii", "V"],
		level: 6,
	},

	// Level 7: Modal interchange
	{ name: "I-iv-bVII-I", degrees: ["I", "iv", "bVII", "I"], level: 7 },
	{
		name: "I-bVI-bVII-I",
		degrees: ["I", "bVI", "bVII", "I"],
		level: 7,
	},
	{
		name: "I-bIII-bVII-IV",
		degrees: ["I", "bIII", "bVII", "IV"],
		level: 7,
	},
	{
		name: "II-V-bII-I",
		degrees: ["ii", "V", "bII", "I"],
		level: 7,
	},

	// Level 8: Chromatic mediant, multi-tonic, Coltrane
	{ name: "I-bIII-V-I", degrees: ["I", "bIII", "V", "I"], level: 8 },
	{
		name: "I-bVI-bIII-V",
		degrees: ["I", "bVI", "bIII", "V"],
		level: 8,
	},
	{
		name: "I-III7-bVI-bII",
		degrees: ["I", "III7", "bVI", "bII"],
		level: 8,
	},
	{
		name: "I-bIII7-bVI7-II7-V-I",
		degrees: ["I", "bIII7", "bVI7", "II7", "V", "I"],
		level: 8,
	},
];

export function getProgressionChords(
	key: Key,
	degrees: ScaleDegree[],
): ChordInfo[] {
	return degrees.map((degree) => getChordInKey(key, degree));
}
