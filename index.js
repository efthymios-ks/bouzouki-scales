(() => {
  window.bouzoukiOptions = {};
  window.bouzoukiOptions.tuning = "D,A,F,C";

  const mainNavbar = document.getElementById("main-navbar");
  const navButtons = mainNavbar.querySelectorAll("button[data-section]");
  const mainContainer = document.getElementById("main-container");
  const sections = Array.from(mainContainer.children);

  function showSection(sectionId) {
    sections.forEach((section) => {
      section.style.display = section.id === sectionId ? "block" : "none";
    });

    navButtons.forEach((btn) => {
      const isActive = btn.dataset.section === sectionId;
      btn.classList.toggle("btn-primary", isActive);
      btn.classList.toggle("btn-outline-primary", !isActive);
    });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  });

  showSection("scales-list-container");
})();
