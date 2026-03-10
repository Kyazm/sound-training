import type { NoteName, NoteWithOctave } from "../../types/music";

export const NOTE_NAMES: NoteName[] = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B",
];

export function noteIndex(note: NoteName): number {
	const index = NOTE_NAMES.indexOf(note);
	if (index === -1) {
		throw new Error(`Invalid note: ${note}`);
	}
	return index;
}

export function transposeNote(note: NoteName, semitones: number): NoteName {
	const index = noteIndex(note);
	const newIndex = (((index + semitones) % 12) + 12) % 12;
	return NOTE_NAMES[newIndex];
}

export function noteToMidi(note: NoteWithOctave): number {
	const match = note.match(/^([A-G]#?)(-?\d+)$/);
	if (!match) {
		throw new Error(`Invalid note: ${note}`);
	}
	const noteName = match[1] as NoteName;
	const octave = Number.parseInt(match[2], 10);
	return (octave + 1) * 12 + noteIndex(noteName);
}

export function midiToNote(midi: number): NoteWithOctave {
	if (midi < 0 || midi > 127) {
		throw new Error(`Invalid MIDI number: ${midi}`);
	}
	const noteIdx = midi % 12;
	const octave = Math.floor(midi / 12) - 1;
	return `${NOTE_NAMES[noteIdx]}${octave}` as NoteWithOctave;
}

export function noteToFrequency(note: NoteWithOctave): number {
	const midi = noteToMidi(note);
	return 440 * 2 ** ((midi - 69) / 12);
}
