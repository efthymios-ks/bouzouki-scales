export class Fret {
  #offset;
  #note;
  #stringNumber;

  constructor(stringNumber, offset, note) {
    if (typeof stringNumber !== "number" || stringNumber < 1) {
      throw new TypeError("stringNumber must be a positive number");
    }

    if (typeof offset !== "number" || offset < 0) {
      throw new TypeError("offset must be a non-negative number");
    }
    
    if (typeof note !== "string") {
      throw new TypeError("note must be a string");
    }

    this.#stringNumber = stringNumber;
    this.#offset = offset;
    this.#note = note;
  }

  get stringNumber() {
    return this.#stringNumber;
  }

  get offset() {
    return this.#offset;
  }

  get note() {
    return this.#note;
  }
}
