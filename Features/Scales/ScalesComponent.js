import { Scale } from "./Scale.js";
import { Note } from "../Notes/Note.js";

(() => {
  const prefix = "scales-list";
  const containerId = `${prefix}-container`;

  function createBaseHtml() {
    const container = document.getElementById(containerId);
    const optionsHtml = Scale.getAllTonics()
      .map((tonic) => {
        const note = new Note(tonic);
        const isSelected = tonic === "D" ? " selected" : "";
        return `<option value="${tonic}"${isSelected}>${tonic} (${note.name})</option>`;
      })
      .join("");

    container.innerHTML = ` 
      <div
        id="${prefix}-controls-row"
        class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3"
      >
        <div class="d-flex align-items-center gap-2">
          <label for="${prefix}-tonic-select" class="form-label fw-bold mb-0" id="${prefix}-tonic-label">Τονική:</label>
          <select id="${prefix}-tonic-select" class="form-select form-select-sm" aria-labelledby="${prefix}-tonic-label">
            ${optionsHtml}
          </select>
        </div>

        <div class="form-check form-switch d-flex align-items-center gap-2">
          <input type="checkbox" class="form-check-input" id="${prefix}-display-names" aria-labelledby="${prefix}-display-names-label" />
          <label for="${prefix}-display-names" class="form-check-label" id="${prefix}-display-names-label">Προβολή με ονόματα</label>
        </div>
      </div>

      <div id="${prefix}-list" class="d-flex flex-wrap align-items-top justify-content-around gap-3"></div>
    `;
  }

  function calculateScaleData(tonic, shouldDisplayNoteNames) {
    const scales = Scale.getAll(tonic);
    const data = scales.map((scale, index) => ({
      id: `${prefix}-scale-${index}`,
      name: scale.name,
      intervals: scale.intervals.join("-"),
      notes: shouldDisplayNoteNames ? scale.getNames() : scale.normalizedNotes,
      otherNames: scale.otherNames,
    }));

    return { data };
  }

  function renderList(tonic, displayName) {
    const scaleList = document.getElementById(`${prefix}-list`);
    const { data } = calculateScaleData(tonic, displayName);

    scaleList.innerHTML = "";

    for (const scale of data) {
      const notesHtml = scale.notes
        .map(
          (n, i) =>
            `<span class="badge bg-secondary me-1 mb-1" id="${
              scale.id
            }-list-note-${i + 1}">${n}</span>`
        )
        .join("");

      const otherNamesHtml = scale.otherNames.length
        ? `<div class="text-muted fst-italic small mt-1">(${scale.otherNames.join(
            ", "
          )})</div>`
        : "";

      scaleList.innerHTML += `
        <div
          id="${scale.id}-list"
          class="flex-grow-1 flex-shrink-1 border border-secondary rounded p-3 shadow-sm"
          style="max-width: 18rem;"
          >
          <h5 id="${scale.id}-list-name" class="fw-bold mb-1">${scale.name}</h5>
          ${otherNamesHtml}
          <div class="fw-semibold mb-2"><strong>Διαστήματα:</strong> ${scale.intervals}</div>
          <div>${notesHtml}</div>
        </div>
      `;
    }
  }

  function renderAll() {
    const tonic = document.getElementById(`${prefix}-tonic-select`).value;
    const displayName = document.getElementById(
      `${prefix}-display-names`
    ).checked;

    renderList(tonic, displayName);
  }

  function main() {
    createBaseHtml();

    const tonicSelect = document.getElementById(`${prefix}-tonic-select`);
    const displayNamesCheckbox = document.getElementById(
      `${prefix}-display-names`
    );

    tonicSelect.addEventListener("change", renderAll);
    displayNamesCheckbox.addEventListener("change", renderAll);

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", main);
})();
