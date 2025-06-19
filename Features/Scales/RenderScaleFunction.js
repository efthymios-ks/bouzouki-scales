import { Chord } from "../Chords/Chord.js";

function renderScales(container, scales, displayNames, prefix) {
  container.innerHTML = "";
  container.classList.add("d-flex", "flex-wrap", "justify-content-center", "gap-3");

  scales.forEach((scale, index) => {
    const id = `${prefix}-scale-${index}`;
    const notes = displayNames ? scale.getNames() : scale.notes;
    const intervals = scale.intervals.join("-");

    const notesHtml = notes
      .map(
        (n, i) =>
          `<span class="badge bg-secondary me-1 mb-1" id="${id}-list-note-${i + 1}">${n}</span>`
      )
      .join("");

    const tile = document.createElement("div");
    tile.id = `${id}-list`;
    tile.className =
      "d-flex flex-column justify-content-between flex-grow-1 flex-shrink-1 border border-secondary rounded p-3 shadow-sm position-relative";
    tile.style.maxWidth = "18rem";

    const tonicBadge = `<span class="position-absolute top-0 end-0 badge bg-info  m-2" style="font-size: 0.7rem;">${scale.tonic}</span>`;

    tile.innerHTML = `
      ${tonicBadge}
      <div>
        <h5 id="${id}-list-name" class="fw-bold mb-1">${scale.name}</h5>
        <div class="fw-semibold mb-2"><strong>Διαστήματα:</strong> ${intervals}</div>
        <div class="mb-2">${notesHtml}</div>
      </div>
      <div class="mt-2 text-center">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#${prefix}-modal" data-scale-name="${scale.name}">Περισσότερα</button>
      </div>
    `;

    container.appendChild(tile);
  });
}

function renderModalHtml(prefix) {
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = `${prefix}-modal`;
  modal.tabIndex = -1;
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header d-flex flex-column align-items-center border-0 pb-1 px-3 py-3">
          <h5 class="modal-title fw-bold text-center w-100" id="${prefix}-modal-label"></h5>
          <button type="button" class="btn-close position-absolute end-0 me-2" data-bs-dismiss="modal" aria-label="Κλείσιμο"></button>
        </div>
        <div class="modal-body text-start px-3 py-3" id="${prefix}-modal-body"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function renderScaleSlide(scale) {
  const titleText = (label, content) => `
    <div class="mb-2">
      <div class="fw-bold text-start">${label}</div>
      <div class="text-start">${content}</div>
    </div>`;

  const otherNamesHtml =
    scale.otherNames?.length > 0 ? titleText("Άλλες ονομασίες:", scale.otherNames.join(", ")) : "";

  const tonicHtml = titleText("Τονική:", `<span class="badge bg-info">${scale.tonic}</span>`);
  const intervalsHtml = titleText("Διαστήματα:", scale.intervals.join("-"));
  const notesHtml = scale.notes
    .map((n) => `<span class="badge bg-secondary me-1 mb-1">${n}</span>`)
    .join("");
  const notesContainer = titleText("Νότες:", notesHtml);

  let chordsHtml = "";
  if (scale.chordsFromD?.length) {
    const chords = scale.chordsFromD.map((chord, index) => {
      const transposed = Chord.transpose(chord, "D", scale.tonic);
      const notes = Chord.getNotes(transposed);
      return { note: scale.notes[index], chord: transposed, notes };
    });

    const rows = chords
      .map(
        ({ note, chord, notes }) => `
        <tr>
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
          <tbody>${rows}</tbody>
        </table>
      </div>`
    );
  }

  return `${otherNamesHtml}${tonicHtml}${intervalsHtml}${notesContainer}${chordsHtml}`;
}

function attachModalHandler(scales, prefix) {
  const modal = document.getElementById(`${prefix}-modal`);
  if (!modal) {
    return;
  }

  modal.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;
    const scaleName = button.getAttribute("data-scale-name");
    const scale = scales.find((s) => s.name === scaleName);
    if (!scale) {
      return;
    }

    const modalTitle = document.getElementById(`${prefix}-modal-label`);
    const modalBody = document.getElementById(`${prefix}-modal-body`);
    modalTitle.textContent = scale.name;

    const variants = scale.variants || [];
    if (variants.length === 0) {
      modalBody.innerHTML = renderScaleSlide(scale);
    } else {
      const allScales = [scale, ...variants];
      const accordionHtml = allScales
        .map((s, i) => {
          const title = i === 0 ? "Βάση" : s.name;
          const expanded = i === 0 ? "true" : "false";
          const showClass = i === 0 ? "show" : "";
          const collapseId = `${prefix}-collapse-${i}`;
          const headingId = `${prefix}-heading-${i}`;
          return `
            <div class="accordion-item">
              <h2 class="accordion-header" id="${headingId}">
                <button class="accordion-button ${
                  i !== 0 ? "collapsed" : ""
                }" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${expanded}" aria-controls="${collapseId}">
                  ${title}
                </button>
              </h2>
              <div id="${collapseId}" class="accordion-collapse collapse ${showClass}" aria-labelledby="${headingId}" data-bs-parent="#${prefix}-accordion">
                <div class="accordion-body">${renderScaleSlide(s)}</div>
              </div>
            </div>`;
        })
        .join("");

      modalBody.innerHTML = `<div class="accordion" id="${prefix}-accordion">${accordionHtml}</div>`;
    }
  });
}

export function renderScalesFunction(
  container,
  scales,
  prefix = "scales-list",
  shouldDisplayNames = false
) {
  if (!container || !Array.isArray(scales)) {
    return;
  }

  if (!document.getElementById(`${prefix}-modal`)) {
    renderModalHtml(prefix);
  }

  attachModalHandler(scales, prefix);

  renderScales(container, scales, shouldDisplayNames, prefix);
}
