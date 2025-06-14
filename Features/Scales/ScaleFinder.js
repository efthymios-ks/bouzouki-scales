import { Note } from "../Notes/Note.js";
import { Scale } from "./Scale.js";

export class ScaleFinder {
  static findScales(inputNotes) {
    if (inputNotes.length !== 7) {
      return [];
    }

    const results = [];
    const existingScales = Scale.getAll();

    for (const existingScale of existingScales) {
      for (const tonic of Note.allNotes) {
        try {
          const scale = new Scale({
            name: existingScale.name,
            tonic,
            intervals: existingScale.intervals,
            otherNames: existingScale.otherNames,
          });

          if (inputNotes.every((note) => scale.notes.includes(note))) {
            results.push(scale);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }

    return results;
  }
}
