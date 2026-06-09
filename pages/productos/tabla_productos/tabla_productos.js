function initTablaProductos() {
  const searchInput = document.getElementById("search");
  const searchBtn   = document.getElementById("search-btn");
  if (!searchInput || !searchBtn) return;

  function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    const rows = document.querySelectorAll("#productos-table tbody tr");
    rows.forEach((r) => {
      r.style.display = r.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
    });
    const visible = [...rows].filter((r) => r.style.display !== "none").length;
    const el = document.getElementById("info-count");
    if (el) el.textContent = visible + " productos encontrados";
  }

  searchBtn.addEventListener("click", applySearch);

  // Eliminar producto
  document.querySelectorAll(".btn-delete").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const codigo = this.dataset.id;
      fetch("/producto/" + codigo, { method: "DELETE" }).then(function (r) {
        if (r.ok) location.reload();
      });
    });
  });
}
