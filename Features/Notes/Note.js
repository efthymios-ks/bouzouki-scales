export class Note {
  static semitoneMap = Object.freeze({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 });
  static #noteNames = Object.freeze({
    C: "Ντο",
    D: "Ρε",
    E: "Μι",
    F: "Φα",
    G: "Σολ",
    A: "Λα",
    B: "Σι",
  });
  static naturalNotes = Object.freeze(Object.keys(Note.#noteNames));
  static allNotes = Object.freeze(
    Note.naturalNotes.flatMap((note) => {
      if (note === "E" || note === "B") {
        return [note];
      }

      return [note, `${note}#`];
    })
  );

  #key;
  #name;

  constructor(note) {
    const noteRegex = new RegExp(`^([${Note.naturalNotes.join("")}])([#b])?$`);
    const match = note.trim().match(noteRegex);
    if (!match) {
      throw new Error(`Unsupported key format: ${note}`);
    }

    const [, baseNote, accidental] = match;
    this.#key = `${baseNote}${accidental || ""}`;

    let name = Note.#noteNames[baseNote];
    if (accidental) {
      name += accidental;
    }

    this.#name = name;
  }

  get key() {
    return this.#key;
  }

  get name() {
    return this.#name;
  }
}
