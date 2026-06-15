const THEME_STORAGE_KEY = "inventario-theme";

function getPreferredTheme() {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch (error) {
    return null;
  }
}

function getTheme() {
  return document.documentElement.dataset.theme || getStoredTheme() || getPreferredTheme();
}

function applyTheme(theme, options = {}) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  const persist = options.persist !== false;

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      // Ignoramos si el navegador bloquea el almacenamiento.
    }
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", nextTheme === "dark" ? "true" : "false");
  });

  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: nextTheme } }));
}

function toggleTheme() {
  applyTheme(getTheme() === "dark" ? "light" : "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getTheme(), { persist: false });

  const toggles = document.querySelectorAll("[data-theme-toggle]");
  toggles.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === THEME_STORAGE_KEY && (event.newValue === "dark" || event.newValue === "light")) {
    applyTheme(event.newValue, { persist: false });
  }
});

window.themeManager = {
  getTheme,
  applyTheme,
  toggleTheme,
};
