import { Scale } from "./Scale.js";
import { Note } from "../Notes/Note.js";
import { Chord } from "../Chords/Chord.js";

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
      <div class="modal fade" id="${prefix}-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header d-flex flex-column align-items-center border-0 pb-1 px-3 py-3">
              <h5 class="modal-title fw-bold text-center w-100" id="${prefix}-modal-label"></h5>
              <button type="button" class="btn-close position-absolute end-0 me-2" data-bs-dismiss="modal" aria-label="Κλείσιμο"></button>
            </div>
            <div class="modal-body text-start px-3 py-3" id="${prefix}-modal-body"></div>
          </div>
        </div>
      </div>
    `;
  }

  function calculateScaleData(tonic, shouldDisplayNoteNames) {
    const scales = Scale.getAll(tonic);
    return {
      data: scales.map((scale, index) => ({
        id: `${prefix}-scale-${index}`,
        name: scale.name,
        intervals: scale.intervals.join("-"),
        notes: shouldDisplayNoteNames ? scale.getNames() : scale.notes,
        otherNames: scale.otherNames,
        chordsFromD: scale.chordsFromD,
        notes: scale.notes,
        tonic: scale.tonic,
      })),
    };
  }

  function renderList(tonic, displayName) {
    const scaleList = document.getElementById(`${prefix}-list`);
    const { data } = calculateScaleData(tonic, displayName);
    scaleList.innerHTML = "";

    for (const scale of data) {
      const notesHtml = scale.notes
        .map(
          (n, i) =>
            `<span class="badge bg-secondary me-1 mb-1" id="${scale.id}-list-note-${
              i + 1
            }">${n}</span>`
        )
        .join("");

      scaleList.innerHTML += `
        <div id="${
          scale.id
        }-list" class="d-flex flex-column justify-content-between flex-grow-1 flex-shrink-1 border border-secondary rounded p-3 shadow-sm" style="max-width: 18rem;">
          <div>
            <h5 id="${scale.id}-list-name" class="fw-bold mb-1">${scale.name}</h5>
            <div class="fw-semibold mb-2"><strong>Διαστήματα:</strong> ${scale.intervals}</div>
            <div class="mb-2">${notesHtml}</div>
          </div>
          <div class="mt-2 text-center">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#${prefix}-modal" data-scale='${JSON.stringify(
        scale
      )}'>Περισσότερα</button>
          </div>
        </div>
      `;
    }
  }

  function renderAll() {
    const tonic = document.getElementById(`${prefix}-tonic-select`).value;
    const displayName = document.getElementById(`${prefix}-display-names`).checked;
    renderList(tonic, displayName);
  }

  function main() {
    createBaseHtml();
    document.getElementById(`${prefix}-tonic-select`).addEventListener("change", renderAll);
    document.getElementById(`${prefix}-display-names`).addEventListener("change", renderAll);
    renderAll();

    document.getElementById(`${prefix}-modal`).addEventListener("show.bs.modal", (event) => {
      const scale = JSON.parse(event.relatedTarget.getAttribute("data-scale"));
      const modalBody = document.getElementById(`${prefix}-modal-body`);
      const modalTitle = document.getElementById(`${prefix}-modal-label`);
      modalTitle.textContent = scale.name;

      const titleText = (label, content) => `
        <div class="mb-2">
          <div class="fw-bold text-start">${label}</div>
          <div class="text-start">${content}</div>
        </div>`;

      const otherNamesHtml = scale.otherNames?.length
        ? titleText("Άλλα ονόματα:", scale.otherNames.join(", "))
        : "";
      const intervalsHtml = titleText("Διαστήματα:", scale.intervals);
      const notesHtml = scale.notes
        .map((n) => `<span class="badge bg-secondary me-1 mb-1">${n}</span>`)
        .join("");
      const notesContainer = titleText("Νότες:", notesHtml);

      let chordsHtml = "";
      if (scale.chordsFromD && scale.chordsFromD.length > 0) {
        const chords = scale.chordsFromD.map((chord, index) => {
          const fromTonic = "D";
          const toTonic = scale.tonic;
          const transposedChord = Chord.transpose(chord, fromTonic, toTonic);
          const chordNotes = Chord.getNotes(transposedChord);
          const note = scale.notes[index];
          return { note, chord: transposedChord, notes: chordNotes };
        });

        const rowsHtml = chords
          .map(
            ({ note, chord, notes }) =>
              `<tr>
                <td>${note}</td>
                <td>${chord}</td>
                <td>${notes.join(" ")}</td>
              </tr>`
          )
          .join("");

        chordsHtml = titleText(
          "Συγχορδίες:",
          `<div class="table-responsive mt-2 w-100">
            <table class="table table-sm table-bordered mb-0 text-center">
              <thead>
                <tr>
                  <th class="text-center">Νότα</th>
                  <th class="text-center" colspan="2">Συγχορδία</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>`
        );
      }

      modalBody.innerHTML = `${otherNamesHtml}${intervalsHtml}${notesContainer}${chordsHtml}`;
    });
  }

  main();
})();
