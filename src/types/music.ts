export type NoteName =
	| "C"
	| "C#"
	| "D"
	| "D#"
	| "E"
	| "F"
	| "F#"
	| "G"
	| "G#"
	| "A"
	| "A#"
	| "B";

export type NoteWithOctave = `${NoteName}${number}`;

export type IntervalType =
	| "P1"
	| "m2"
	| "M2"
	| "m3"
	| "M3"
	| "P4"
	| "tritone"
	| "P5"
	| "m6"
	| "M6"
	| "m7"
	| "M7"
	| "P8"
	| "m9"
	| "M9"
	| "P11"
	| "m13"
	| "M13";

export type ChordQuality =
	| "major"
	| "minor"
	| "dim"
	| "aug"
	| "maj7"
	| "dom7"
	| "min7"
	| "min7b5"
	| "dim7"
	| "minMaj7"
	| "aug7"
	| "maj9"
	| "dom9"
	| "min9"
	| "dom7b9"
	| "dom7sharp9"
	| "dom7sharp11"
	| "min11"
	| "dom13"
	| "maj7sharp11";

export type ScaleMode =
	| "ionian"
	| "dorian"
	| "phrygian"
	| "lydian"
	| "mixolydian"
	| "aeolian"
	| "locrian"
	| "melodicMinor"
	| "harmonicMinor"
	| "lydianDominant"
	| "altered"
	| "wholeTone"
	| "diminishedHW"
	| "diminishedWH"
	| "blues"
	| "bebopDominant"
	| "bebopMajor"
	| "bebopDorian";

export type ScaleDegree =
	| "I"
	| "ii"
	| "iii"
	| "IV"
	| "V"
	| "vi"
	| "vii"
	| "bII"
	| "bIII"
	| "bV"
	| "bVI"
	| "bVII"
	| "II7"
	| "III7"
	| "VI7"
	| "#IVdim7"
	| "iv"
	| "bVII7"
	| "bIII7"
	| "bVI7"
	| "IV7";

export interface ChordInfo {
	root: NoteName;
	quality: ChordQuality;
	notes: NoteName[];
	degree?: ScaleDegree;
}

export type VoicingType =
	| "rootPosition"
	| "firstInversion"
	| "secondInversion"
	| "thirdInversion"
	| "shell"
	| "drop2";

export type FunctionalCategory = "tonic" | "subdominant" | "dominant";

export interface Key {
	root: NoteName;
	mode: "major" | "minor";
}
