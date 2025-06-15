export class ChordHandPlacement {
  #stringNumber;
  #name;
  #offsets;

  constructor(stringNumber, type, offsets) {
    if (stringNumber < 1 || stringNumber > offsets.length) {
      throw new RangeError(
        `stringNumber must be >= 1 and <= offsets.length (${offsets.length})`
      );
    }

    this.#stringNumber = stringNumber;
    this.#name = type;
    this.#offsets = offsets;
  }

  get stringNumber() {
    return this.#stringNumber;
  }

  get type() {
    return this.#name;
  }

  get offsets() {
    return this.#offsets;
  }
}
