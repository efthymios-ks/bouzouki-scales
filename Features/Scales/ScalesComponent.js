import { Scale } from "./Scale.js";
import { Note } from "../Notes/Note.js";
import { renderScalesFunction } from "./RenderScaleFunction.js";

(() => {
  const prefix = "scales-list";
  const containerId = `${prefix}-container`;

  function createBaseHtml() {
    const container = document.getElementById(containerId);
    const optionsHtml = Note.allNotes
      .map((tonic) => {
        const note = new Note(tonic);
        const isSelected = tonic === "D" ? " selected" : "";
        return `<option value="${tonic}"${isSelected}>${tonic} (${note.name})</option>`;
      })
      .join("");

    container.innerHTML = ` 
      <div id="${prefix}-controls-row" class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3">
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

  function retrieveScales(tonic) {
    window.bouzoukiNotes = window.bouzoukiNotes || {};
    window.bouzoukiNotes.scales = Scale.getAll(tonic);
  }

  function bindEvents() {
    const tonicSelect = document.getElementById(`${prefix}-tonic-select`);
    const displayNamesCheckbox = document.getElementById(`${prefix}-display-names`);

    const render = () => {
      retrieveScales(tonicSelect.value);
      renderScalesFunction(
        document.getElementById(`${prefix}-list`),
        window.bouzoukiNotes.scales,
        "scales-component",
        displayNamesCheckbox.checked
      );
    };

    tonicSelect.addEventListener("change", render);
    displayNamesCheckbox.addEventListener("change", render);

    render();
  }

  createBaseHtml();
  bindEvents();
})();
