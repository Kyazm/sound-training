import type {
	ChordQuality,
	FunctionalCategory,
	IntervalType,
	Key,
	NoteName,
	NoteWithOctave,
	ScaleMode,
	VoicingType,
} from "../../types/music";
import {
	getRecommendedScales,
	getStandardsByDifficulty,
	transposeStandard,
} from "../../data/jazzStandards";
import { STANDARD_MELODIES, type MelodyNote } from "../../data/standardMelodies";
import { INTERVAL_SEMITONES } from "../music/intervals";
import { NOTE_NAMES, transposeNote } from "../music/notes";
import {
	PROGRESSION_PATTERNS,
	getProgressionChords,
} from "../music/progressions";
import { SCALE_DISPLAY_NAMES, SCALE_FORMULAS } from "../music/scales";
import { buildVoicing } from "../music/voicings";

export interface IntervalQuestionData {
	root: NoteWithOctave;
	target: NoteWithOctave;
	interval: IntervalType;
	direction: "ascending" | "descending" | "harmonic";
}

export interface ProgressionQuestionData {
	key: Key;
	degrees: string[];
	chords: { root: string; quality: string }[];
}

export interface ScaleQuestionData {
	root: NoteName;
	mode: ScaleMode;
	notes: NoteName[];
}

export interface MelodyQuestionData {
	root: NoteName;
	notes: NoteName[];
	notesWithOctave: NoteWithOctave[];
	scaleNotes: NoteName[];
	/** BPM for playback (from jazz standard or default) */
	bpm?: number;
	/** Beat durations per note (parallel to notesWithOctave) */
	noteBeats?: number[];
	/** Jazz standard reference for standard-based melody questions */
	standardRef?: {
		title: string;
		composer: string;
		sectionName: string;
		chords: { root: NoteName; quality: ChordQuality; degree: string; scales: string[] }[];
	};
}

export interface VoicingQuestionData {
	root: NoteName;
	quality: ChordQuality;
	voicingType: VoicingType;
	notes: NoteWithOctave[];
	/** Choices for chord quality (step 1) */
	qualityChoices: ChordQuality[];
	/** Choices for voicing type (step 2) */
	voicingChoices: VoicingType[];
}

export interface FunctionalHarmonyQuestionData {
	/** Jazz standard source */
	standardTitle: string;
	standardComposer: string;
	sectionName: string;
	/** Key of the excerpt */
	key: NoteName;
	mode: "major" | "minor";
	/** BPM for playback */
	bpm: number;
	/** All chords in the excerpt (for playback and display) */
	chords: {
		root: NoteName;
		quality: ChordQuality;
		degree: string;
		fn: FunctionalCategory;
		beats: number;
	}[];
	/** Index of the target chord the user must identify */
	targetIndex: number;
	/** Correct function of the target chord */
	correctFunction: FunctionalCategory;
	/** Recommended scales for the target chord (display strings) */
	targetScales: string[];
}

// --- Interval levels ---
// Lv.1: 初心者向け基本5種、Lv.4-5: 複合インターバル含む
const INTERVAL_LEVELS: Record<number, IntervalType[]> = {
	1: ["P1", "m3", "M3", "P5", "P8"],
	2: ["m2", "M2", "m3", "M3", "P4", "tritone", "P5", "m6", "M6", "P8"],
	3: [
		"m2", "M2", "m3", "M3", "P4", "tritone",
		"P5", "m6", "M6", "m7", "M7", "P8",
	],
	4: [
		"P1", "m2", "M2", "m3", "M3", "P4", "tritone",
		"P5", "m6", "M6", "m7", "M7", "P8",
		"m9", "M9",
	],
	5: [
		"P1", "m2", "M2", "m3", "M3", "P4", "tritone",
		"P5", "m6", "M6", "m7", "M7", "P8",
		"m9", "M9", "P11", "m13", "M13",
	],
};

// --- Scale levels ---
// Lv.1: Ionian/Aeolian のみ、Lv.6-7: Bebop含む
const SCALE_LEVELS: Record<number, ScaleMode[]> = {
	1: ["ionian", "aeolian"],
	2: ["ionian", "dorian", "mixolydian", "aeolian"],
	3: [
		"ionian", "dorian", "phrygian", "lydian",
		"mixolydian", "aeolian", "locrian",
	],
	4: [
		"ionian", "dorian", "phrygian", "lydian",
		"mixolydian", "aeolian", "locrian",
		"melodicMinor", "harmonicMinor",
	],
	5: [
		"dorian", "lydian", "mixolydian",
		"melodicMinor", "harmonicMinor",
		"lydianDominant", "altered",
		"wholeTone", "diminishedHW",
	],
	6: [
		"dorian", "lydian", "mixolydian",
		"melodicMinor", "harmonicMinor",
		"lydianDominant", "altered",
		"wholeTone", "diminishedHW", "diminishedWH",
		"blues",
	],
	7: [
		"dorian", "lydian", "mixolydian",
		"melodicMinor", "harmonicMinor",
		"lydianDominant", "altered",
		"wholeTone", "diminishedHW", "diminishedWH",
		"blues", "bebopDominant", "bebopMajor", "bebopDorian",
	],
};

// --- Voicing levels (merged with chord recognition) ---
const VOICING_LEVELS: Record<number, VoicingType[]> = {
	1: ["rootPosition"],
	2: ["rootPosition", "firstInversion"],
	3: ["rootPosition", "firstInversion", "secondInversion"],
	4: ["rootPosition", "firstInversion", "secondInversion", "thirdInversion"],
	5: ["rootPosition", "firstInversion", "secondInversion", "thirdInversion", "shell"],
	6: ["rootPosition", "firstInversion", "secondInversion", "thirdInversion", "shell", "drop2"],
	7: ["rootPosition", "firstInversion", "secondInversion", "thirdInversion", "shell", "drop2"],
};

// Chord qualities used per voicing level (absorbs old chord training levels)
const VOICING_CHORD_LEVELS: Record<number, ChordQuality[]> = {
	1: ["major", "minor"],
	2: ["major", "minor", "dim", "aug"],
	3: ["major", "minor", "dim", "aug", "maj7", "dom7", "min7"],
	4: ["maj7", "dom7", "min7", "min7b5", "dim7", "minMaj7"],
	5: ["maj7", "dom7", "min7", "min7b5", "dim7", "minMaj7", "aug7"],
	6: [
		"maj7", "dom7", "min7", "min7b5", "dim7", "minMaj7", "aug7",
		"maj9", "dom9", "min9",
	],
	7: [
		"maj7", "dom7", "min7", "min7b5",
		"dom7b9", "dom7sharp9", "dom7sharp11",
		"min11", "dom13", "maj7sharp11",
		"maj9", "dom9", "min9",
	],
};

// --- Melody levels ---
const MELODY_LEVELS: Record<number, { length: number; chromatic: boolean; maxJump: number; octaveRange: number }> = {
	1: { length: 4, chromatic: false, maxJump: 3, octaveRange: 1 },
	2: { length: 6, chromatic: false, maxJump: 5, octaveRange: 2 },
	3: { length: 8, chromatic: false, maxJump: 7, octaveRange: 2 },
	4: { length: 6, chromatic: true, maxJump: 5, octaveRange: 2 },
	5: { length: 8, chromatic: true, maxJump: 8, octaveRange: 3 },
	6: { length: 10, chromatic: true, maxJump: 10, octaveRange: 3 },
};

// --- Helpers ---

function randomElement<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomRoot(fixedRoot?: NoteName): NoteName {
	return fixedRoot ?? randomElement(NOTE_NAMES);
}

function pickChoices<T>(correct: T, pool: T[], count: number): T[] {
	const choices = new Set<T>([correct]);
	const available = pool.filter((item) => item !== correct);
	while (choices.size < count && available.length > 0) {
		const idx = Math.floor(Math.random() * available.length);
		choices.add(available[idx]);
		available.splice(idx, 1);
	}
	return shuffle([...choices]);
}

function shuffle<T>(arr: T[]): T[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

// --- Generators ---

export function generateIntervalQuestion(level: number, fixedRoot?: NoteName): {
	data: IntervalQuestionData;
	correctAnswer: string;
	choices: string[];
} {
	const clampedLevel = Math.max(1, Math.min(5, level));
	const pool = INTERVAL_LEVELS[clampedLevel];
	const interval = randomElement(pool);
	const root = randomRoot(fixedRoot);
	const semitones = INTERVAL_SEMITONES[interval];
	const rootOctave = randomElement([3, 4, 5]);
	const direction = randomElement([
		"ascending",
		"descending",
		"harmonic",
	] as const);

	let targetNote: NoteName;
	let targetOctave: number;

	if (direction === "descending") {
		targetNote = transposeNote(root, -semitones);
		const rootIdx = NOTE_NAMES.indexOf(root);
		const targetIdx = NOTE_NAMES.indexOf(targetNote);
		targetOctave = targetIdx > rootIdx ? rootOctave - 1 : rootOctave;
		if (semitones > 12) targetOctave -= 1;
	} else {
		targetNote = transposeNote(root, semitones);
		const rootIdx = NOTE_NAMES.indexOf(root);
		const targetIdx = NOTE_NAMES.indexOf(targetNote);
		targetOctave = targetIdx < rootIdx ? rootOctave + 1 : rootOctave;
		if (semitones > 12) targetOctave += 1;
	}

	const rootNoteWithOctave = `${root}${rootOctave}` as NoteWithOctave;
	const targetNoteWithOctave = `${targetNote}${targetOctave}` as NoteWithOctave;

	return {
		data: {
			root: rootNoteWithOctave,
			target: targetNoteWithOctave,
			interval,
			direction,
		},
		correctAnswer: interval,
		choices: pickChoices(interval, pool, Math.min(pool.length, 6)),
	};
}

export function generateScaleQuestion(level: number, fixedRoot?: NoteName): {
	data: ScaleQuestionData;
	correctAnswer: string;
	choices: string[];
} {
	const clampedLevel = Math.max(1, Math.min(7, level));
	const pool = SCALE_LEVELS[clampedLevel];
	const mode = randomElement(pool);
	const root = randomRoot(fixedRoot);
	const formula = SCALE_FORMULAS[mode];
	const notes = formula.map((s) => transposeNote(root, s));

	return {
		data: { root, mode, notes },
		correctAnswer: mode,
		choices: pickChoices(mode, pool, Math.min(pool.length, 6)),
	};
}

const AVAILABLE_KEYS: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

export function generateProgressionQuestion(level: number, fixedRoot?: NoteName): {
	data: ProgressionQuestionData;
	correctAnswer: string;
	choices: string[];
} {
	const clampedLevel = Math.max(1, Math.min(8, level));
	const levelPatterns = PROGRESSION_PATTERNS.filter(
		(p) => p.level === clampedLevel,
	);
	const pool =
		levelPatterns.length > 0
			? levelPatterns
			: PROGRESSION_PATTERNS.filter(
					(p) => Math.abs(p.level - clampedLevel) <= 1,
				);

	const pattern = randomElement(pool);
	const keyRoot = fixedRoot ?? randomElement(AVAILABLE_KEYS);
	const key: Key = { root: keyRoot, mode: "major" };
	const chordInfos = getProgressionChords(key, pattern.degrees);
	const chords = chordInfos.map((c) => ({
		root: c.root,
		quality: c.quality,
	}));

	const allNames = pool.map((p) => p.name);
	const adjacentPatterns = PROGRESSION_PATTERNS.filter(
		(p) => Math.abs(p.level - clampedLevel) <= 1 && p.name !== pattern.name,
	).map((p) => p.name);
	const namePool = [...new Set([...allNames, ...adjacentPatterns])].filter(
		(n) => n !== pattern.name,
	);

	return {
		data: { key, degrees: pattern.degrees as string[], chords },
		correctAnswer: pattern.name,
		choices: pickChoices(
			pattern.name,
			[pattern.name, ...namePool],
			Math.min(namePool.length + 1, 4),
		),
	};
}

// --- Melody ---

const DIATONIC_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

/** Convert flat notation (Bb, Eb, etc.) from MusicXML to sharp-based NoteName */
const FLAT_TO_SHARP: Record<string, NoteName> = {
	Cb: "B", Db: "C#", Eb: "D#", Fb: "E", Gb: "F#", Ab: "G#", Bb: "A#",
};

function normalizeNoteName(step: string): NoteName {
	if (FLAT_TO_SHARP[step]) return FLAT_TO_SHARP[step];
	return step as NoteName;
}

/** Convert MelodyNote[] from standardMelodies to our internal format */
function convertMelodyNotes(
	melodyNotes: MelodyNote[],
): { notes: NoteName[]; notesWithOctave: NoteWithOctave[]; noteBeats: number[] } {
	const notes: NoteName[] = [];
	const notesWithOctave: NoteWithOctave[] = [];
	const noteBeats: number[] = [];

	for (const mn of melodyNotes) {
		if (mn.isRest) continue; // skip rests for answer matching
		const note = normalizeNoteName(mn.step);
		notes.push(note);
		notesWithOctave.push(`${note}${mn.octave}` as NoteWithOctave);
		noteBeats.push(mn.beats);
	}

	return { notes, notesWithOctave, noteBeats };
}

/** IDs of standards that have real melody data in STANDARD_MELODIES */
const STANDARDS_WITH_MELODY = Object.keys(STANDARD_MELODIES);

function buildMelody(
	root: NoteName,
	length: number,
	chromatic: boolean,
	maxJump: number,
	octaveRange: number,
): { notes: NoteName[]; notesWithOctave: NoteWithOctave[]; scaleNotes: NoteName[] } {
	const oneOctave = chromatic
		? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
		: DIATONIC_SEMITONES;
	const scaleNotes = oneOctave.map((s) => transposeNote(root, s));

	const pool: number[] = [];
	for (let oct = 0; oct < octaveRange; oct++) {
		for (const s of oneOctave) {
			pool.push(oct * 12 + s);
		}
	}

	const indices: number[] = [0];
	let currentIdx = 0;

	for (let i = 1; i < length; i++) {
		const minIdx = Math.max(0, currentIdx - maxJump);
		const maxIdx = Math.min(pool.length - 1, currentIdx + maxJump);
		let nextIdx: number;
		do {
			nextIdx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
		} while (nextIdx === currentIdx && maxIdx > minIdx);
		indices.push(nextIdx);
		currentIdx = nextIdx;
	}

	const baseOctave = 4;
	const rootIdx = NOTE_NAMES.indexOf(root);
	const notes: NoteName[] = [];
	const notesWithOctave: NoteWithOctave[] = [];

	for (const idx of indices) {
		const semitones = pool[idx];
		const note = transposeNote(root, semitones);
		const absoluteSemitone = rootIdx + semitones;
		const octave = baseOctave + Math.floor(absoluteSemitone / 12);
		notes.push(note);
		notesWithOctave.push(`${note}${octave}` as NoteWithOctave);
	}

	return { notes, notesWithOctave, scaleNotes };
}

/** Excerpt length (notes) per melody level for real melody data */
const MELODY_EXCERPT_NOTES: Record<number, number> = {
	3: 8, 4: 12, 5: 16, 6: 24,
};

export function generateMelodyQuestion(level: number, fixedRoot?: NoteName): {
	data: MelodyQuestionData;
	correctAnswer: string;
	choices: string[];
	prompt?: string;
} {
	const clampedLevel = Math.max(1, Math.min(6, level));
	const config = MELODY_LEVELS[clampedLevel];

	// Lv.3+: use real melody data from MusicXML-parsed standards
	if (clampedLevel >= 3) {
		const maxDiff = clampedLevel <= 3 ? 1 : clampedLevel <= 5 ? 3 : 5;
		const standards = getStandardsByDifficulty(maxDiff)
			.filter((s) => STANDARDS_WITH_MELODY.includes(s.id));

		if (standards.length > 0) {
			let std = randomElement(standards);
			const melodyData = STANDARD_MELODIES[std.id];

			// Filter out rests for the melodic notes
			const allConverted = convertMelodyNotes(melodyData);
			const excerptLen = MELODY_EXCERPT_NOTES[clampedLevel] ?? 8;

			// Pick a random excerpt
			const maxStart = Math.max(0, allConverted.notes.length - excerptLen);
			const startIdx = Math.floor(Math.random() * (maxStart + 1));
			const endIdx = Math.min(startIdx + excerptLen, allConverted.notes.length);

			const notes = allConverted.notes.slice(startIdx, endIdx);
			const notesWithOctave = allConverted.notesWithOctave.slice(startIdx, endIdx);
			const noteBeats = allConverted.noteBeats.slice(startIdx, endIdx);

			// Also collect the corresponding MelodyNote slice (including rests) for playback
			// We need to map back to original indices including rests
			const playbackNotes: MelodyNote[] = [];
			let melodicIdx = 0;
			for (const mn of melodyData) {
				if (melodicIdx >= endIdx) break;
				if (mn.isRest) {
					if (melodicIdx >= startIdx) playbackNotes.push(mn);
					continue;
				}
				if (melodicIdx >= startIdx) playbackNotes.push(mn);
				melodicIdx++;
			}

			const scaleNotes = DIATONIC_SEMITONES.map((s) => transposeNote(std.originalKey, s));

			// Find matching section/chords for context
			const section = randomElement(std.sections);
			const chordInfo = section.chords.slice(0, 4).map((c) => {
				const scales = getRecommendedScales(c.quality, c.fn);
				return {
					root: c.root,
					quality: c.quality,
					degree: c.degree,
					scales: scales.map((s) => SCALE_DISPLAY_NAMES[s]),
				};
			});

			return {
				data: {
					root: std.originalKey,
					notes,
					notesWithOctave,
					scaleNotes,
					bpm: std.bpm,
					noteBeats,
					standardRef: {
						title: std.title,
						composer: std.composer,
						sectionName: section.name,
						chords: chordInfo,
					},
				},
				correctAnswer: notesWithOctave.join(","),
				choices: [],
				prompt: `「${std.title}」(${std.composer}) のメロディを聴き取ってください`,
			};
		}
	}

	// Lv.1-2: diatonic random melody (no standard reference)
	const root = fixedRoot ?? "C";
	const { notes, notesWithOctave, scaleNotes } = buildMelody(
		root,
		config.length,
		config.chromatic,
		config.maxJump,
		config.octaveRange,
	);

	return {
		data: { root, notes, notesWithOctave, scaleNotes },
		correctAnswer: notesWithOctave.join(","),
		choices: [],
	};
}

// --- Voicing ---

export function generateVoicingQuestion(level: number, fixedRoot?: NoteName): {
	data: VoicingQuestionData;
	correctAnswer: string;
	choices: string[];
} {
	const clampedLevel = Math.max(1, Math.min(7, level));
	const voicingPool = VOICING_LEVELS[clampedLevel];
	const chordPool = VOICING_CHORD_LEVELS[clampedLevel];
	const voicingType = randomElement(voicingPool);
	const quality = randomElement(chordPool);
	const root = randomRoot(fixedRoot);
	const baseOctave = randomElement([3, 4]);
	const notes = buildVoicing(root, quality, voicingType, baseOctave);

	// Combined answer: "quality|voicingType"
	const correctAnswer = `${quality}|${voicingType}`;
	const qualityChoices = pickChoices(quality, chordPool, Math.min(chordPool.length, 6));
	const voicingChoices = pickChoices(voicingType, voicingPool, Math.min(voicingPool.length, 4));

	return {
		data: { root, quality, voicingType, notes, qualityChoices, voicingChoices },
		correctAnswer,
		choices: [], // UI handles two-step selection directly
	};
}

// --- Functional Harmony (jazz standard based) ---

/** Difficulty mapping: level → max standard difficulty */
const FUNCTIONAL_DIFFICULTY: Record<number, number> = {
	1: 1, 2: 2, 3: 3, 4: 4, 5: 5,
};

/** Excerpt length (in chords) per level */
const FUNCTIONAL_EXCERPT_LENGTH: Record<number, number> = {
	1: 4, 2: 4, 3: 6, 4: 8, 5: 8,
};

export function generateFunctionalHarmonyQuestion(level: number, fixedRoot?: NoteName): {
	data: FunctionalHarmonyQuestionData;
	correctAnswer: string;
	choices: string[];
	prompt: string;
} {
	const clampedLevel = Math.max(1, Math.min(5, level));
	const maxDiff = FUNCTIONAL_DIFFICULTY[clampedLevel];
	const excerptLen = FUNCTIONAL_EXCERPT_LENGTH[clampedLevel];
	const standards = getStandardsByDifficulty(maxDiff);

	let std = randomElement(standards);
	if (fixedRoot) {
		std = transposeStandard(std, fixedRoot);
	}

	// Flatten all chords from all sections
	const allChords = std.sections.flatMap((sec) =>
		sec.chords.map((ch) => ({ ...ch, sectionName: sec.name })),
	);

	// Pick a random excerpt of excerptLen consecutive chords
	const maxStart = Math.max(0, allChords.length - excerptLen);
	const startIdx = Math.floor(Math.random() * (maxStart + 1));
	const excerpt = allChords.slice(startIdx, startIdx + excerptLen);

	// Pick a random target chord within the excerpt
	const targetIdx = Math.floor(Math.random() * excerpt.length);
	const target = excerpt[targetIdx];
	const scales = getRecommendedScales(target.quality, target.fn);
	const scaleNames = scales.map((s) => SCALE_DISPLAY_NAMES[s]);

	const allFunctions: FunctionalCategory[] = ["tonic", "subdominant", "dominant"];

	return {
		data: {
			standardTitle: std.title,
			standardComposer: std.composer,
			sectionName: target.sectionName,
			key: std.originalKey,
			mode: std.mode,
			bpm: std.bpm,
			chords: excerpt.map((ch) => ({
				root: ch.root,
				quality: ch.quality,
				degree: ch.degree,
				fn: ch.fn,
				beats: ch.beats,
			})),
			targetIndex: targetIdx,
			correctFunction: target.fn,
			targetScales: scaleNames,
		},
		correctAnswer: target.fn,
		choices: allFunctions,
		prompt: `「${std.title}」(${std.composer}) — ?のコードの機能は？`,
	};
}
