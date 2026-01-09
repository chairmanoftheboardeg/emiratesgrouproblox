(function () {
  // Theme
  const storageKey = "egr_theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") return applyTheme(saved);

    // Default: light, but respect system preference
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  // Dropdowns (click-to-toggle; click outside closes)
  function initDropdowns() {
    const dropdowns = document.querySelectorAll("[data-dropdown]");
    function closeAll(except) {
      dropdowns.forEach(d => {
        if (d !== except) d.setAttribute("data-open", "false");
      });
    }

    dropdowns.forEach(d => {
      const btn = d.querySelector("button");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = d.getAttribute("data-open") === "true";
        closeAll(d);
        d.setAttribute("data-open", isOpen ? "false" : "true");
      });
    });

    document.addEventListener("click", (e) => {
      const inDropdown = e.target.closest("[data-dropdown]");
      if (!inDropdown) closeAll(null);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  }

  // Theme toggle button
  function initThemeToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  initTheme();
  initDropdowns();
  initThemeToggle();
})();
