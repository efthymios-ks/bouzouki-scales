import { Note } from "../Notes/Note.js";
import Scales from "./Scales.js";

export class Scale {
  #name;
  #tonic;
  #intervals;
  #otherNames;
  #chordsFromD = [];
  #notes;

  constructor({ name, tonic, intervals, otherNames = [], chordsFromD = [] }) {
    if (!name) {
      throw new Error("Name must be a non-empty string");
    }

    if (!tonic || !Note.allNotes.includes(tonic)) {
      throw new Error("Invalid or missing tonic");
    }

    if (!intervals || !Array.isArray(intervals)) {
      throw new Error("Intervals must be an array");
    }

    const totalNotes = intervals.length + 1;
    if (totalNotes !== 8) {
      throw new Error("Intervals must produce 8 notes");
    }

    if (
      chordsFromD &&
      chordsFromD.length.length > 0 &&
      chordsFromD.length !== Note.naturalNotes.length
    ) {
      throw new Error(
        "Chords from D must have the same length as the number of notes in the scale"
      );
    }

    this.#name = name;
    this.#tonic = tonic;
    this.#intervals = intervals;
    this.#otherNames = otherNames || [];
    this.#chordsFromD = chordsFromD || [];
    this.#notes = this.#calculateNotes();
  }

  get name() {
    return this.#name;
  }

  get tonic() {
    return this.#tonic;
  }

  get intervals() {
    return this.#intervals;
  }

  get otherNames() {
    return this.#otherNames;
  }

  get chordsFromD() {
    return this.#chordsFromD;
  }

  get notes() {
    return this.#notes;
  }

  getNames() {
    return this.#name.map((note) => new Note(note).name);
  }

  static getAll(tonic = "C") {
    return Scales.map(
      (scale) =>
        new Scale({
          ...scale,
          tonic,
        })
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  #calculateNotes() {
    const semitoneToNote = Note.allNotes.reduce((acc, note, index) => {
      acc[index % 12] = note;
      return acc;
    }, {});

    let currentSemitone = this.#getSemitone(this.#tonic);

    const notes = [];
    notes.push(this.#tonic);
    for (const step of this.#intervals) {
      currentSemitone = (currentSemitone + step) % 12;
      notes.push(semitoneToNote[currentSemitone]);
    }

    return notes;
  }

  #getSemitone(note) {
    const baseSemitone = Note.semitoneMap[note[0]];
    const allTonicsLength = Note.allNotes.length;
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
}
