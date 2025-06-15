import { ChordHandPlacement } from "./ChordHandPlacement.js";
import { BouzoukiChords } from "./BouzoukiChords.js";

export class BouzoukiFourStringChords extends BouzoukiChords {
  constructor() {
    super([
      new ChordHandPlacement(1, "minor", [0, 0, 0, 2]),
      new ChordHandPlacement(1, "major", [0, 0, 1, 2]),

      new ChordHandPlacement(2, "minor", [0, 2, 1, 2]),
      new ChordHandPlacement(2, "major", [0, 1, 0, 2]),

      new ChordHandPlacement(3, "minor", [0, 1, 2, 2]),
      new ChordHandPlacement(3, "major", [0, 2, 2, 2]),

      new ChordHandPlacement(4, "minor", [0, 0, 0, 2]),
      new ChordHandPlacement(4, "major", [0, 0, 1, 2]),
    ]);
  }
}
