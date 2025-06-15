import { Fret } from "./Fret.js";
import { Scale } from "../Scales/Scale.js";
import { BouzoukiFourStringChords } from "../Chords/BouzoukiFourStringChords.js";

export class Fretboard {
  static #size = 15;
  static #octaveSize = 12;
  static #highlightColumns = new Set([0, 3, 5, 7, 10, 12]);
  #openNotes;
  #matrix;

  constructor(openNotes) {
    this.#openNotes = this.#parseOpenNotes(openNotes);
    this.#matrix = this.#calculateMatrix();
  }

  #parseOpenNotes(openNotes) {
    if (typeof openNotes === "string") {
      return openNotes
        .split(/[, -]+/)
        .map((n) => n.trim().toUpperCase())
        .filter((n) => n.length > 0);
    }

    if (Array.isArray(openNotes)) {
      return openNotes.map((n) => n.toUpperCase());
    }

    throw new TypeError("openNotes must be a string or array");
  }

  #calculateMatrix() {
    const notes = Scale.getAllTonics();
    const rows = this.#openNotes.length;
    const cols = Fretboard.#size + 1; // include open string (0 fret)
    const matrix = [];

    for (let r = 0; r < rows; r++) {
      const startIndex = notes.indexOf(this.#openNotes[r]);
      if (startIndex === -1) {
        throw new Error(`Invalid note in openNotes: ${this.#openNotes[r]}`);
      }

      const rowNotes = [];
      for (let c = 0; c < cols; c++) {
        rowNotes.push(notes[(startIndex + c) % notes.length]);
      }
      matrix.push(rowNotes);
    }

    return matrix;
  }

  get openNotes() {
    return this.#openNotes;
  }

  getMatrix() {
    return this.#matrix.map((rowNotes, stringNumber) =>
      rowNotes.map((note, offset) => new Fret(stringNumber + 1, offset, note))
    );
  }

  findChordPositions(stringNumber, chordType, tonic) {
    const bouzoukiChords = new BouzoukiFourStringChords();
    const chordPositions = bouzoukiChords.chordPositions.filter(
      (cp) => cp.stringNumber === stringNumber && cp.type === chordType
    );

    if (chordPositions.length === 0) {
      return [];
    }

    const matrix = this.#matrix;
    const stringRow = matrix[stringNumber - 1];
    const tonicIndex = stringRow.indexOf(tonic.toUpperCase());
    if (tonicIndex === -1) {
      return [];
    }

    const chordPosition = chordPositions[0];
    const offsets = chordPosition.offsets;

    const baseOffset = offsets[stringNumber - 1];
    let adjustedOffsets = offsets.map((offset) => offset - baseOffset);
    if (adjustedOffsets.some((offset) => offset < 0)) {
      adjustedOffsets = adjustedOffsets.map(
        (offset) => offset + Fretboard.#octaveSize
      );
    }

    const absoluteOffsets = adjustedOffsets.map(
      (offset) => tonicIndex + offset
    );

    if (absoluteOffsets.some((fret) => fret > Fretboard.#size)) {
      return [];
    }

    return adjustedOffsets.map((offset, index) => ({
      stringNumber: index + 1,
      fretOffset: tonicIndex + offset,
    }));
  }

  #findChordPositionsInAnyString(chordType, tonic) {
    const matrix = this.#matrix;
    for (let stringNumber = matrix.length; stringNumber >= 1; stringNumber--) {
      const positions = this.findChordPositions(stringNumber, chordType, tonic);
      if (positions.length === 0) {
        continue;
      }

      const maxFret = Math.max(...positions.map((p) => p.fretOffset));
      if (maxFret > Fretboard.#size) {
        continue;
      }

      return positions;
    }

    return [];
  }

  #findChordNotes(chordType, tonic) {
    const positions = this.#findChordPositionsInAnyString(chordType, tonic);
    if (positions.length === 0) {
      return [];
    }

    const matrix = this.#matrix;
    const notesUsed = positions.map(({ stringNumber, fretOffset }) => {
      const stringRow = matrix[stringNumber - 1];
      const index = fretOffset % stringRow.length;
      return stringRow[index];
    });

    return [...new Set(notesUsed)];
  }

  getScaleChords(scale) {
    let scaleNotes = scale.notes;
    if (scaleNotes[scaleNotes.length - 1] === scaleNotes[0]) {
      scaleNotes = scaleNotes.slice(0, -1);
    }

    const wrapIndex = (i) => (i + scaleNotes.length) % scaleNotes.length;
    const result = [];

    for (let i = 0; i < scaleNotes.length; i++) {
      const base = scaleNotes[i];
      const sequences = [
        [0, 2, 4].map((offset) => scaleNotes[wrapIndex(i + offset)]),
        [-4, -2, 0].map((offset) => scaleNotes[wrapIndex(i + offset)]),
        [-2, 0, 2].map((offset) => scaleNotes[wrapIndex(i + offset)]),
      ];

      let validChord = null;
      for (const sequence of sequences) {
        const sequenceBase = sequence[0];
        const majorNotes = this.#findChordNotes("major", sequenceBase);
        if (majorNotes.every((note) => scaleNotes.includes(note))) {
          validChord = { base: sequenceBase, type: "major", notes: majorNotes };
          break;
        }

        const minorNotes = this.#findChordNotes("minor", sequenceBase);
        if (minorNotes.every((note) => scaleNotes.includes(note))) {
          validChord = { base: sequenceBase, type: "minor", notes: minorNotes };
          break;
        }
      }

      if (!validChord) {
        throw new Error(
          `No valid major or minor chord found for note ${base} in the scale`
        );
      }

      const chordType =
        validChord.type === "major"
          ? `${validChord.base}+`
          : `${validChord.base}-`;

      result.push({
        note: base,
        chordName: chordType,
        notes: validChord.notes,
      });
    }

    return result;
  }

  static get octaveSize() {
    return Fretboard.#octaveSize;
  }

  static get highlightColumns() {
    return Fretboard.#highlightColumns;
  }
}
