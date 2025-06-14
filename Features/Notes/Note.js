export class Note {
  static semitoneMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  static #noteToName = {
    C: "Ντο",
    D: "Ρε",
    E: "Μι",
    F: "Φα",
    G: "Σολ",
    A: "Λα",
    B: "Σι",
  };

  static #baseNotes = Object.keys(Note.#noteToName);
  static #noteRegex = new RegExp(`^([${Note.#baseNotes.join("")}])([#b])?$`);

  #key;
  #name;

  constructor(key) {
    const match = key.match(Note.#noteRegex);
    if (!match) {
      throw new Error(`Unsupported key format: ${key}`);
    }

    // C# => ["C#", "C", "#"]
    // Db => ["Db", "D", "b"]
    const [, baseNote, accidental] = match;
    this.#key = key;

    let name = Note.#noteToName[baseNote];
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
