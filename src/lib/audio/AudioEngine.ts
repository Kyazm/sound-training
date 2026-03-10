import * as Tone from "tone";

class AudioEngine {
	private synth: Tone.PolySynth | null = null;
	private initialized = false;

	private createSynth(): Tone.PolySynth {
		const synth = new Tone.PolySynth(Tone.Synth, {
			oscillator: { type: "triangle" },
			envelope: {
				attack: 0.02,
				decay: 0.3,
				sustain: 0.4,
				release: 0.8,
			},
		}).toDestination();
		synth.maxPolyphony = 10;
		return synth;
	}

	async init(): Promise<void> {
		if (this.initialized) return;
		await Tone.start();
		await Tone.context.resume();
		this.synth = this.createSynth();
		this.initialized = true;
	}

	isReady(): boolean {
		return this.initialized;
	}

	playNote(note: string, duration = 0.6): void {
		if (!this.synth) return;
		const now = Tone.now();
		this.synth.triggerAttackRelease(note, duration, now);
	}

	playInterval(
		note1: string,
		note2: string,
		mode: "melodic" | "harmonic",
	): void {
		if (!this.synth) return;
		const now = Tone.now();

		if (mode === "harmonic") {
			this.synth.triggerAttackRelease(note1, 0.8, now);
			this.synth.triggerAttackRelease(note2, 0.8, now);
		} else {
			this.synth.triggerAttackRelease(note1, 0.4, now);
			this.synth.triggerAttackRelease(note2, 0.4, now + 0.35);
		}
	}

	playChord(notes: string[], mode: "block" | "arpeggio"): void {
		if (!this.synth) return;
		const now = Tone.now();

		if (mode === "block") {
			for (const note of notes) {
				this.synth.triggerAttackRelease(note, 0.8, now);
			}
		} else {
			for (let i = 0; i < notes.length; i++) {
				this.synth.triggerAttackRelease(notes[i], 0.6, now + i * 0.25);
			}
		}
	}

	playProgression(chords: string[][], bpm = 120): void {
		if (!this.synth) return;
		const now = Tone.now();
		const beatDuration = 60 / bpm;

		for (let ci = 0; ci < chords.length; ci++) {
			const chordTime = now + ci * beatDuration;
			for (const note of chords[ci]) {
				this.synth.triggerAttackRelease(note, beatDuration * 0.85, chordTime);
			}
		}
	}

	/** Play chords with individual beat durations (e.g., from jazz standards) */
	playProgressionWithBeats(
		chords: { notes: string[]; beats: number }[],
		bpm = 120,
	): number {
		if (!this.synth) return 0;
		const now = Tone.now();
		const beatDuration = 60 / bpm;
		let offset = 0;

		for (const chord of chords) {
			const duration = chord.beats * beatDuration;
			for (const note of chord.notes) {
				this.synth.triggerAttackRelease(note, duration * 0.85, now + offset);
			}
			offset += duration;
		}
		return offset;
	}

	/** Play melody notes with individual beat durations */
	playMelodyWithBeats(
		notes: { note: string; beats: number }[],
		bpm = 120,
	): number {
		if (!this.synth) return 0;
		const now = Tone.now();
		const beatDuration = 60 / bpm;
		let offset = 0;

		for (const n of notes) {
			const duration = n.beats * beatDuration;
			this.synth.triggerAttackRelease(n.note, duration * 0.8, now + offset);
			offset += duration;
		}
		return offset;
	}

	playScale(notes: string[], ascending = true): void {
		if (!this.synth) return;
		const now = Tone.now();
		const ordered = ascending ? notes : [...notes].reverse();

		for (let i = 0; i < ordered.length; i++) {
			this.synth.triggerAttackRelease(ordered[i], 0.25, now + i * 0.2);
		}
	}

	playMelody(notes: string[], bpm = 120): void {
		if (!this.synth) return;
		const now = Tone.now();
		const noteDuration = 60 / bpm;

		for (let i = 0; i < notes.length; i++) {
			this.synth.triggerAttackRelease(
				notes[i],
				noteDuration * 0.8,
				now + i * noteDuration,
			);
		}
	}

	stop(): void {
		if (!this.synth) return;
		// Dispose the synth to cancel all scheduled triggerAttackRelease events
		this.synth.disconnect();
		this.synth.dispose();
		// Recreate immediately so playback can resume
		this.synth = this.createSynth();
	}

	setVolume(db: number): void {
		if (!this.synth) return;
		this.synth.volume.value = db;
	}
}

export const audioEngine = new AudioEngine();
