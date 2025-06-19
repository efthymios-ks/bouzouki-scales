import { Note } from "../Notes/Note.js";
import Scales from "./Scales.js";

export class Scale {
  #name;
  #tonic;
  #intervals = [];
  #otherNames = [];
  #chordsFromD = [];
  #variants = [];
  #notes = [];

  constructor({ name, tonic, intervals, otherNames = [], chordsFromD = [], variants = {} }) {
    if (!name) {
      throw new Error("Name must be a non-empty string");
    }

    if (!tonic || !Note.allNotes.includes(tonic)) {
      throw new Error(`Invalid or missing tonic for scale ${name}`);
    }

    if (!Array.isArray(intervals) || intervals.length === 0) {
      throw new Error(`Intervals must be a non-empty array (${name})`);
    }

    if (intervals.length !== Note.naturalNotes.length) {
      throw new Error(
        `Intervals must produce a total ${Note.naturalNotes.length + 1} notes (${name})`
      );
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
    this.#variants = variants || [];
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

  get variants() {
    return this.#variants;
  }

  #setVariants(variants) {
    this.#variants = variants;
  }

  getNames() {
    return this.#notes.map((note) => new Note(note).name);
  }

  static getAll(tonic = "C") {
    return Scales.map((scale) => Scale.#toScale(scale, tonic)).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  static findScales(inputNotes) {
    if (inputNotes.length !== 7) {
      return [];
    }

    const results = [];
    const seenNames = new Set();

    const parents = []; // { scale, variants: [] }
    const variants = []; // { scale, parentName }

    // Collect parents (all tonics)
    for (const baseScale of Scale.getAll()) {
      for (const tonic of Note.allNotes) {
        try {
          const parentScale = new Scale({ ...baseScale.toObject(), tonic });
          if (parentScale.#notesMatch(inputNotes)) {
            parents.push({ scale: parentScale, variants: [] });
          }
        } catch {
          // ignore errors here
        }
      }
    }

    // Collect variants (all tonics)
    for (const baseScale of Scale.getAll()) {
      for (const tonic of Note.allNotes) {
        for (const variant of baseScale.variants || []) {
          try {
            const variantScale = new Scale({ ...variant.toObject(), tonic });
            if (variantScale.#notesMatch(inputNotes)) {
              variants.push({ scale: variantScale, parentName: baseScale.name });
            }
          } catch {
            // ignore errors here
          }
        }
      }
    }

    // Map variants to matched parents by name (keep tonic independently)
    for (const variantEntry of variants) {
      const parentEntry = parents.find((p) => p.scale.name === variantEntry.parentName);
      if (parentEntry) {
        // Add variant to parent's variants list if not duplicate by name+tonic
        if (
          !parentEntry.variants.some(
            (v) => v.name === variantEntry.scale.name && v.tonic === variantEntry.scale.tonic
          )
        ) {
          parentEntry.variants.push(variantEntry.scale);
        }
      }
    }

    // Add parents to results and mark their names as seen
    for (const parentEntry of parents) {
      if (!seenNames.has(parentEntry.scale.name)) {
        // Attach variants only for display (you can use parentEntry.variants in your UI)
        const parentWithVariants = new Scale({ ...parentEntry.scale.toObject() });
        parentWithVariants.#setVariants(parentEntry.variants);
        results.push(parentWithVariants);
        seenNames.add(parentEntry.scale.name);
      }
    }

    // Add variants that don't have a matched parent (prefix name, keep tonic)
    for (const variantEntry of variants) {
      const parentMatched = parents.some((p) => p.scale.name === variantEntry.parentName);
      if (!parentMatched) {
        const prefixedName = `${variantEntry.parentName} (${variantEntry.scale.name})`;
        if (!seenNames.has(prefixedName)) {
          results.push(new Scale({ ...variantEntry.scale.toObject(), name: prefixedName }));
          seenNames.add(prefixedName);
        }
      }
    }

    return results;
  }

  toObject() {
    return {
      name: this.name,
      tonic: this.tonic,
      intervals: this.intervals,
      otherNames: this.otherNames,
      chordsFromD: this.chordsFromD,
      variants: this.variants.map((variant) => new Scale(variant.toObject())),
    };
  }

  static #toScale(scaleAsObject, tonic) {
    const variants = (scaleAsObject.variants || []).map((variant) =>
      Scale.#toScale(variant, tonic)
    );

    return new Scale({
      ...scaleAsObject,
      tonic,
      variants,
    });
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

  #notesMatch(inputNotes) {
    if (!Array.isArray(inputNotes)) {
      return false;
    }

    const scalesToCheck = [this, ...this.#variants];
    return scalesToCheck.some((scale) => inputNotes.every((note) => scale.notes.includes(note)));
  }
}
