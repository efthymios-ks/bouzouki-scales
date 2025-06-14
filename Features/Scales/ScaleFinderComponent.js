import { Note } from "../Notes/Note.js";
import { Scale } from "./Scale.js";
import { ScaleFinder } from "./ScaleFinder.js";

(() => {
  const prefix = "scale-finder";
  const containerId = `${prefix}-container`;

  const container = document.getElementById(containerId);
  container.innerHTML = ` 
    <div class="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mb-3">
      <div class="form-check form-switch">
        <input type="checkbox" class="form-check-input" id="${prefix}-display-names-label" />
        <label class="form-check-label" for="${prefix}-display-names-label">Προβολή με ονόματα</label>
      </div>
      <div id="${prefix}-selection-info" class="badge bg-danger text-white fw-semibold rounded px-2 py-1">0/7</div>
      <button class="btn btn-sm btn-outline-secondary" id="${prefix}-clear-btn">Καθαρισμός</button>
    </div>
    <div id="${prefix}-notesContainer" class="d-flex flex-wrap justify-content-center gap-2"></div>
    <div id="${prefix}-results" class="mt-4"></div>
  `;

  const displayNamesCheckbox = container.querySelector(`#${prefix}-display-names-label`);
  const notesContainer = container.querySelector(`#${prefix}-notesContainer`);
  const resultsContainer = container.querySelector(`#${prefix}-results`);
  const clearButton = container.querySelector(`#${prefix}-clear-btn`);
  const selectionInfo = container.querySelector(`#${prefix}-selection-info`);

  function getNoteName(noteKey) {
    return new Note(noteKey).name;
  }

  function renderResults(scales) {
    if (!scales.length) {
      resultsContainer.innerHTML = `<p class="text-muted text-center">Δεν βρέθηκαν δρόμοι</p>`;
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "d-flex flex-wrap justify-content-center gap-3";

    for (const scale of scales) {
      const tonicName = getNoteName(scale.tonic);
      const intervals = scale.intervals.join("-");
      const notes = scale.notes.join(" ");

      const tile = document.createElement("div");
      tile.className = "card flex-grow-1";
      tile.style.minWidth = "200px";
      tile.style.maxWidth = "250px";

      tile.innerHTML = `
      <div class="card-body">
        <h5 class="card-title text-center">${scale.name}</h5>
        <p class="card-text mb-1"><strong>Τονική:</strong> ${tonicName}</p> 
        <p class="card-text mb-1"><strong>Διαστήματα:</strong> ${intervals}</p>
        <p class="card-text"><strong>Νότες:</strong> ${notes}</p>
      </div>
    `;

      wrapper.appendChild(tile);
    }

    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(wrapper);
  }

  function dispatchSelectionChange(selectedKeys) {
    const foundScales = ScaleFinder.findScales(selectedKeys);
    renderResults(foundScales);
  }

  function updateSelectionInfo() {
    const selectedCount = notesContainer.querySelectorAll(`.${prefix}-note.active`).length;
    selectionInfo.textContent = `${selectedCount}/7`;

    if (selectedCount === 7) {
      selectionInfo.classList.remove("bg-danger");
      selectionInfo.classList.add("bg-success");
    } else {
      selectionInfo.classList.remove("bg-success");
      selectionInfo.classList.add("bg-danger");
    }
  }

  function renderNotes() {
    notesContainer.innerHTML = "";

    Note.allNotes.forEach((noteKey) => {
      const noteName = getNoteName(noteKey);
      const noteElement = document.createElement("button");
      noteElement.type = "button";
      noteElement.className = `${prefix}-note btn btn-outline-primary d-flex flex-column align-items-center`;
      noteElement.dataset.key = noteKey;
      noteElement.dataset.name = noteName;
      noteElement.tabIndex = 0;

      noteElement.innerHTML = displayNamesCheckbox.checked ? noteName : noteKey;

      noteElement.addEventListener("click", () => {
        const wasActive = noteElement.classList.contains("active");
        const activeNotes = notesContainer.querySelectorAll(`.${prefix}-note.active`);

        if (wasActive) {
          noteElement.classList.remove("active", "btn-primary");
          noteElement.classList.add("btn-outline-primary");
        } else if (activeNotes.length < 7) {
          noteElement.classList.add("active", "btn-primary");
          noteElement.classList.remove("btn-outline-primary");
        } else {
          return;
        }

        updateSelectionInfo();

        const currentSelected = Array.from(
          notesContainer.querySelectorAll(`.${prefix}-note.active`)
        ).map((n) => n.dataset.key);

        if (currentSelected.length === 7) {
          dispatchSelectionChange(currentSelected);
        } else {
          resultsContainer.innerHTML = "";
        }
      });

      notesContainer.appendChild(noteElement);
    });

    updateSelectionInfo();
  }

  function toggleNoteLabels() {
    const showNoteNames = displayNamesCheckbox.checked;
    Array.from(notesContainer.children).forEach((noteElem) => {
      const key = noteElem.dataset.key;
      const name = noteElem.dataset.name;
      noteElem.innerHTML = showNoteNames ? name : key;
    });
  }

  function clearSelection() {
    Array.from(notesContainer.children).forEach((noteElem) => {
      noteElem.classList.remove("active", "btn-primary");
      noteElem.classList.add("btn-outline-primary");
    });
    resultsContainer.innerHTML = "";
    updateSelectionInfo();
  }

  displayNamesCheckbox.addEventListener("change", () => {
    toggleNoteLabels();
    updateSelectionInfo();
  });

  clearButton.addEventListener("click", () => {
    clearSelection();
  });

  renderNotes();
})();
