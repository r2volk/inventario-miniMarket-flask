// ui.js — Micro-interactions for the dashboard shell, sidebar, and modals.

document.addEventListener("DOMContentLoaded", () => {
  const sidebarToggle = document.querySelector("[data-sidebar-toggle]");

  sidebarToggle && sidebarToggle.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });

  document.addEventListener("click", (event) => {
    if (event.target.matches(".overlay, [data-modal-close]")) {
      cerrarModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.getElementById("modal-root").innerHTML.trim()) {
      cerrarModal();
    }
  });
});
