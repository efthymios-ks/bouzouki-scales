export class BouzoukiChords {
  #chordPositions;

  constructor(chordPositions) {
    this.#chordPositions = chordPositions || [];
  }

  get chordPositions() {
    return this.#chordPositions;
  }
}
