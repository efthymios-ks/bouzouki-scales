import { Note } from "../Notes/Note.js";

export class Chord {
  static #chordRegex = (() => {
    const roots = [...new Set(Note.allNotes.map((note) => note.toUpperCase()))].join("");
    return new RegExp(`^([${roots}][#b]?)(\\+|-|dim)$`);
  })();

  static transpose(chord, fromTonic, toTonic) {
    const noteMap = Note.allNotes.map((note) => note.toUpperCase());

    const getNoteIndex = (note) => noteMap.indexOf(note.toUpperCase());
    const fromIndex = getNoteIndex(fromTonic);
    const toIndex = getNoteIndex(toTonic);
    if (fromIndex === -1) {
      throw new Error(`Invalid fromTonic: ${fromTonic}`);
    }
    if (toIndex === -1) {
      throw new Error(`Invalid toTonic: ${toTonic}`);
    }

    const match = chord.match(Chord.#chordRegex);
    if (!match) {
      throw new Error(`Invalid chord format: ${chord}`);
    }

    const [_, root, suffix] = match;
    const rootIndex = getNoteIndex(root);
    if (rootIndex === -1) {
      throw new Error(`Invalid chord root: ${root}`);
    }

    const interval = (toIndex - fromIndex + noteMap.length) % noteMap.length;
    const newIndex = (rootIndex + interval) % noteMap.length;
    return noteMap[newIndex] + suffix;
  }

  static getNotes(chord) {
    const noteMap = Note.allNotes.map((n) => n.toUpperCase());
    const match = chord.match(Chord.#chordRegex);
    if (!match) {
      throw new Error(`Invalid chord format: ${chord}`);
    }

    const [_, root, suffix] = match;
    const rootIndex = noteMap.indexOf(root.toUpperCase());
    if (rootIndex === -1) {
      throw new Error(`Invalid chord root: ${root}`);
    }

    const intervals = {
      "+": [0, 4, 7],
      "-": [0, 3, 7],
      dim: [0, 4, 7, 10],
    }[suffix];

    if (!intervals) {
      throw new Error(`Unknown chord suffix: ${suffix}`);
    }

    return intervals.map((i) => noteMap[(rootIndex + i) % noteMap.length]);
  }
}
