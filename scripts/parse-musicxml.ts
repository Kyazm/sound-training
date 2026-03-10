/**
 * MusicXML parser: extracts melody notes with pitch + beat duration
 * from the chord-melody-dataset.
 *
 * Usage: npx tsx scripts/parse-musicxml.ts
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface MelodyNote {
	/** e.g. "C", "F#", "Bb" */
	step: string;
	octave: number;
	/** duration in beats (quarter = 1, eighth = 0.5, etc.) */
	beats: number;
	/** true if this is a rest */
	isRest?: boolean;
}

interface StandardMelody {
	id: string;
	/** Notes of the melody in the original key */
	notes: MelodyNote[];
}

// Map of our jazz standard IDs to dataset folder names
const STANDARD_MAP: Record<string, string> = {
	"all-of-me": "all_of_me",
	"all-the-things-you-are": "all_the_things_you_are",
	"blue-bossa": "blue_bossa",
	"beautiful-love": "beautiful_love",
	"body-and-soul": "body_and_soul",
	"how-high-the-moon": "how_high_the_moon",
	"joy-spring": "joy_spring",
	"misty": "misty",
	"stella-by-starlight": "stella_by_starlight",
	"take-the-a-train": "take_the_a_train",
	"days-of-wine-and-roses": "days_of_wine_and_roses",
	"there-will-never-be-another-you": "there_will_never_be_another_you",
	"black-orpheus": "black_orpheus",
	"moments-notice": "moments_notice",
	"on-green-dolphin-street": "dolphin",
};

// Map our original keys to file names (c.xml = C, f.xml = F, etc.)
const KEY_FILE_MAP: Record<string, string> = {
	C: "c.xml",
	"C#": "cs.xml",
	Db: "cs.xml",
	D: "d.xml",
	"D#": "ds.xml",
	Eb: "ds.xml",
	E: "e.xml",
	F: "f.xml",
	"F#": "fs.xml",
	Gb: "fs.xml",
	G: "g.xml",
	"G#": "gs.xml",
	Ab: "gs.xml",
	A: "a.xml",
	"A#": "as.xml",
	Bb: "as.xml",
	B: "b.xml",
};

// Our standards' original keys
const STANDARD_KEYS: Record<string, string> = {
	"all-of-me": "C",
	"all-the-things-you-are": "Ab",
	"blue-bossa": "C",       // originally Cm, dataset is in C
	"beautiful-love": "D",    // originally Dm
	"body-and-soul": "Db",
	"how-high-the-moon": "G",
	"joy-spring": "F",
	"misty": "Eb",
	"stella-by-starlight": "Bb",
	"take-the-a-train": "C",
	"days-of-wine-and-roses": "F",
	"there-will-never-be-another-you": "Eb",
	"black-orpheus": "A",      // originally Am
	"moments-notice": "Eb",
	"on-green-dolphin-street": "C",
};

const DATASET_DIR = "/tmp/chord-melody-dataset";

function parseAlter(alterText: string | null): string {
	if (!alterText) return "";
	const alter = Number.parseInt(alterText);
	if (alter === 1) return "#";
	if (alter === -1) return "b";
	return "";
}

function parseMusicXml(xmlContent: string): MelodyNote[] {
	const notes: MelodyNote[] = [];

	// Extract divisions (ticks per quarter note)
	const divisionsMatch = xmlContent.match(/<divisions>(\d+)<\/divisions>/);
	const divisions = divisionsMatch ? Number.parseInt(divisionsMatch[1]) : 1;

	// Extract all note and forward/backup elements in order
	// Simple regex-based parsing (sufficient for this structured data)
	const noteRegex =
		/<note>([\s\S]*?)<\/note>|<forward>\s*<duration>(\d+)<\/duration>\s*<\/forward>/g;

	let match: RegExpExecArray | null;
	while (true) {
		match = noteRegex.exec(xmlContent);
		if (!match) break;

		// Forward (rest/skip)
		if (match[2]) {
			const dur = Number.parseInt(match[2]);
			notes.push({ step: "R", octave: 0, beats: dur / divisions, isRest: true });
			continue;
		}

		const noteContent = match[1];

		// Skip chord notes (secondary notes in a chord)
		if (noteContent.includes("<chord/>")) continue;

		// Check for rest
		if (noteContent.includes("<rest")) {
			const durMatch = noteContent.match(/<duration>(\d+)<\/duration>/);
			if (durMatch) {
				const dur = Number.parseInt(durMatch[1]);
				notes.push({ step: "R", octave: 0, beats: dur / divisions, isRest: true });
			}
			continue;
		}

		// Extract pitch
		const stepMatch = noteContent.match(/<step>([A-G])<\/step>/);
		const octaveMatch = noteContent.match(/<octave>(\d+)<\/octave>/);
		const alterMatch = noteContent.match(/<alter>(-?\d+)<\/alter>/);
		const durMatch = noteContent.match(/<duration>(\d+)<\/duration>/);

		if (stepMatch && octaveMatch && durMatch) {
			const step = stepMatch[1] + parseAlter(alterMatch ? alterMatch[1] : null);
			const octave = Number.parseInt(octaveMatch[1]);
			const dur = Number.parseInt(durMatch[1]);

			// Check for octave transposition
			const transposeMatch = xmlContent.match(
				/<octave-change>(-?\d+)<\/octave-change>/,
			);
			const octaveChange = transposeMatch
				? Number.parseInt(transposeMatch[1])
				: 0;

			// Check for tied notes (only count the first note of a tie)
			const hasTieStop =
				noteContent.includes('<tie type="stop"') &&
				!noteContent.includes('<tie type="start"');
			if (hasTieStop) {
				// Extend previous note's duration
				if (notes.length > 0 && !notes[notes.length - 1].isRest) {
					notes[notes.length - 1].beats += dur / divisions;
				}
				continue;
			}

			notes.push({
				step,
				octave: octave + octaveChange,
				beats: dur / divisions,
			});
		}
	}

	return notes;
}

function main() {
	const results: StandardMelody[] = [];
	let found = 0;
	let notFound = 0;

	for (const [stdId, folderName] of Object.entries(STANDARD_MAP)) {
		const key = STANDARD_KEYS[stdId];
		if (!key) {
			console.warn(`No key defined for ${stdId}`);
			notFound++;
			continue;
		}

		const fileName = KEY_FILE_MAP[key];
		if (!fileName) {
			// Try C as fallback
			console.warn(`No file mapping for key ${key}, trying c.xml`);
		}

		const filePath = join(DATASET_DIR, folderName, fileName || "c.xml");
		if (!existsSync(filePath)) {
			console.warn(`File not found: ${filePath}`);
			notFound++;
			continue;
		}

		const xml = readFileSync(filePath, "utf-8");
		const notes = parseMusicXml(xml);

		// Filter out leading rests and trailing rests
		let start = 0;
		while (start < notes.length && notes[start].isRest) start++;
		let end = notes.length - 1;
		while (end > start && notes[end].isRest) end--;
		const trimmed = notes.slice(start, end + 1);

		results.push({ id: stdId, notes: trimmed });
		const melodicNotes = trimmed.filter((n) => !n.isRest);
		console.log(
			`✅ ${stdId}: ${melodicNotes.length} notes, ${trimmed.reduce((s, n) => s + n.beats, 0)} total beats`,
		);
		found++;
	}

	console.log(`\nFound: ${found}, Not found: ${notFound}`);

	// Generate TypeScript output
	const tsLines: string[] = [];
	tsLines.push("// Auto-generated from chord-melody-dataset MusicXML files");
	tsLines.push("// Do not edit manually\n");
	tsLines.push("export interface MelodyNote {");
	tsLines.push("\tstep: string;");
	tsLines.push("\toctave: number;");
	tsLines.push("\tbeats: number;");
	tsLines.push("\tisRest?: boolean;");
	tsLines.push("}\n");
	tsLines.push(
		"export const STANDARD_MELODIES: Record<string, MelodyNote[]> = {",
	);

	for (const { id, notes } of results) {
		tsLines.push(`\t"${id}": [`);
		for (const n of notes) {
			if (n.isRest) {
				tsLines.push(
					`\t\t{ step: "R", octave: 0, beats: ${n.beats}, isRest: true },`,
				);
			} else {
				tsLines.push(
					`\t\t{ step: "${n.step}", octave: ${n.octave}, beats: ${n.beats} },`,
				);
			}
		}
		tsLines.push("\t],");
	}

	tsLines.push("};\n");

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const outPath = join(
		__dirname,
		"../src/data/standardMelodies.ts",
	);
	writeFileSync(outPath, tsLines.join("\n"));
	console.log(`\nWritten to ${outPath}`);
}

main();
