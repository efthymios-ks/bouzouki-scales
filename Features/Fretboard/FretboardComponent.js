import { Fretboard } from "./Fretboard.js";
import { Scale } from "../Scales/Scale.js";

(() => {
  const containerId = "fretboard";

  const createFretboardFromClass = (containerId, openNotesInput) => {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container #${containerId} not found`);
    }

    const fretboard = new Fretboard(openNotesInput);
    const matrix = fretboard.getMatrix();

    const scale = new Scale({
      name: "Αρμονικό μινόρε",
      intervals: [2, 1, 2, 2, 1, 3, 1],
      tonic: "D",
    });
    const scaleCords = fretboard.getScaleChords(scale);
    console.log(scaleCords);

    container.innerHTML = "";
    container.className = "d-flex flex-column gap-2";

    const octaveSize = Fretboard.octaveSize;
    const highlightColumns = Fretboard.highlightColumns;

    // Create rows for each string
    matrix.forEach((stringFrets, idx) => {
      const stringNumber = idx + 1;
      const row = document.createElement("div");
      row.className = "d-flex gap-1";
      row.dataset.stringNumber = stringNumber;

      stringFrets.forEach((fret) => {
        const fretDiv = document.createElement("div");
        fretDiv.className = [
          "d-flex",
          "justify-content-center",
          "align-items-center",
          "border",
          "bg-light",
          "text-body",
          "fw-semibold",
          "flex-shrink-0",
        ].join(" ");

        fretDiv.style.width = "40px";
        fretDiv.style.height = "40px";
        fretDiv.textContent = fret.note;

        fretDiv.dataset.stringNumber = fret.stringNumber;
        fretDiv.dataset.fretOffset = fret.offset;

        if (highlightColumns.has(fret.offset % octaveSize)) {
          fretDiv.classList.remove("bg-light", "text-body");
          fretDiv.style.backgroundColor = "#e2e3e5";
          fretDiv.style.color = "#495057";
          fretDiv.style.borderRight = "2px solid #ced4da";
        }

        row.appendChild(fretDiv);
      });

      container.appendChild(row);
    });

    // Create fret number row
    const numberOfFrets = matrix[0].length;
    const numberRow = document.createElement("div");
    numberRow.className = "d-flex gap-1";

    for (let i = 0; i < numberOfFrets; i++) {
      const cell = document.createElement("div");
      cell.className = [
        "d-flex",
        "justify-content-center",
        "align-items-center",
        "flex-shrink-0",
      ].join(" ");
      cell.style.width = "40px";
      cell.style.height = "40px";

      if (highlightColumns.has(i % octaveSize)) {
        const badge = document.createElement("span");
        badge.className =
          "badge rounded-circle d-flex justify-content-center align-items-center fs-6 bg-secondary text-white";
        badge.style.width = "28px";
        badge.style.height = "28px";
        badge.textContent = i;
        cell.appendChild(badge);
      } else {
        cell.textContent = i;
        cell.classList.add("text-secondary", "fs-7", "fw-light");
      }

      numberRow.appendChild(cell);
    }
    container.appendChild(numberRow);

    // Removed highlight button completely
  };

  const highlightChordPositions = (fretboard) => {
    const container = document.getElementById(containerId);

    // Reset all fret cells styles
    container.querySelectorAll("div.d-flex > div.border").forEach((div) => {
      div.style.backgroundColor = "";
      div.style.color = "";
      div.classList.remove("bg-warning", "text-dark");
      const offset = parseInt(div.dataset.fretOffset, 10);
      if (Fretboard.highlightColumns.has(offset % Fretboard.octaveSize)) {
        div.style.backgroundColor = "#e2e3e5";
        div.style.color = "#495057";
        div.classList.remove("bg-light", "text-body");
      } else {
        div.classList.add("bg-light", "text-body");
      }
    });

    // Parameters for chord to highlight
    const stringNumber = 3;
    const chordType = "major";
    const tonic = "D";
    const positions = fretboard.findChordPositions(
      stringNumber,
      chordType,
      tonic
    );

    positions.forEach(({ stringNumber, fretOffset }) => {
      // Find the string row by data-string-number
      const row = container.querySelector(
        `div.d-flex[data-string-number="${stringNumber}"]`
      );
      if (!row) {
        return;
      }
      // Find the fret cell by data-fret-offset
      const fretDiv = Array.from(row.children).find(
        (div) => parseInt(div.dataset.fretOffset, 10) === fretOffset
      );
      if (fretDiv) {
        fretDiv.classList.remove("bg-light", "text-body");
        fretDiv.classList.add("bg-warning", "text-dark");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const fretboardElement = document.getElementById(containerId);
    if (!fretboardElement) {
      return;
    }

    const layout = fretboardElement.getAttribute("data-layout") || "";
    createFretboardFromClass(containerId, layout);
  });
})();
