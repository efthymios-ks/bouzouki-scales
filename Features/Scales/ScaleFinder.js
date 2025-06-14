import { Scale } from "./Scale.js";

export class ScaleFinder {
  static findScales(inputNotes) {
    if (inputNotes.length != 7) return [];

    const results = [];

    const existingScales = Scale.getAll();
    console.table(existingScales);
    for (const existingScale of existingScales) {
      for (const tonic of Scale.getAllTonics()) {
        try {
          const scale = new Scale({
            name: existingScale.name,
            tonic: tonic,
            intervals: existingScale.intervals,
            otherNames: existingScale.otherNames,
          });
          const scaleNotes = scale.notes;

          if (inputNotes.every((note) => scaleNotes.includes(note))) {
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
