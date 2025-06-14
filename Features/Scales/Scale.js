import { Note } from "../Notes/Note.js";
import Scales from "./Scales.js";

export class Scale {
  static #naturalNotes = ["C", "D", "E", "F", "G", "A", "B"];

  constructor({ name, tonic, intervals, otherNames = [] }) {
    if (!name || typeof name !== "string") {
      throw new Error("Name must be a non-empty string");
    }

    if (!tonic || !Scale.getAllTonics().includes(tonic)) {
      throw new Error("Invalid or missing tonic");
    }

    if (!intervals || !Array.isArray(intervals)) {
      throw new Error("Intervals must be an array");
    }

    const totalNotes = intervals.length + 1;
    if (totalNotes !== 8) {
      throw new Error("Intervals must produce 8 notes");
    }

    this._name = name;
    this._otherNames = otherNames || [];
    this._tonic = tonic;
    this._intervals = intervals;
    this._notes = this.#calculateNotes();
    this._normalizedNotes = this.#calculateNormalizedNotes();
  }

  get name() {
    return this._name;
  }

  get otherNames() {
    return this._otherNames;
  }

  get tonic() {
    return this._tonic;
  }

  get intervals() {
    return this._intervals;
  }

  get notes() {
    return this._notes;
  }

  get normalizedNotes() {
    return this._normalizedNotes;
  }

  // Literal notes with sharps/flats matching semitones directly
  #calculateNotes() {
    const semitoneToNote = Scale.getAllTonics().reduce((acc, note, index) => {
      acc[index % 12] = note;
      return acc;
    }, {});

    // Get tonic semitone
    const tonic = this._tonic;
    let currentSemitone = this.#getSemitone(tonic);

    const notes = [];
    notes.push(tonic);
    for (const step of this._intervals) {
      currentSemitone = (currentSemitone + step) % 12;
      notes.push(semitoneToNote[currentSemitone]);
    }

    return notes;
  }

  // Normalized notes respecting letter sequence with accidentals
  #calculateNormalizedNotes() {
    const tonic = this._tonic;
    let currentSemitone = this.#getSemitone(tonic);

    const letters = Scale.#naturalNotes;
    let letterIndex = letters.indexOf(tonic[0]);

    const notes = [];
    notes.push(tonic);
    for (const step of this._intervals) {
      currentSemitone = (currentSemitone + step) % 12;

      letterIndex = (letterIndex + 1) % letters.length;
      const letter = letters[letterIndex];
      const letterBaseSemitone = Note.semitoneMap[letter];

      let diff = currentSemitone - letterBaseSemitone;
      if (diff > 6) {
        diff -= 12;
      } else if (diff < -6) {
        diff += 12;
      }

      let note = letter;
      if (diff === 1) {
        note += "#";
      } else if (diff === -1) {
        note += "b";
      }

      notes.push(note);
    }

    return notes;
  }

  getNames() {
    return this._normalizedNotes.map((note) => new Note(note).name);
  }

  #getSemitone(note) {
    const baseSemitone = Note.semitoneMap[note[0]];
    const allTonicsLength = Scale.getAllTonics().length;
    if (note.length > 1) {
      if (note[1] === "#") {
        return (baseSemitone + 1) % allTonicsLength;
      }

      if (note[1] === "b") {
        return (baseSemitone + (allTonicsLength - 1)) % allTonicsLength;
      }
    }

    return baseSemitone;
  }

  static getAllTonics() {
    return ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  }

  static getAll(tonic = "C") {
    return Scales.map(
      (scale) =>
        new Scale({
          name: scale.name,
          tonic,
          intervals: scale.intervals,
          otherNames: scale.otherNames,
        })
    ).sort((a, b) => a.name.localeCompare(b.name));
  }
}
