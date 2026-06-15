function initTablaProductos() {
  const searchInput = document.getElementById("search");
  const searchBtn = document.getElementById("search-btn");
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

  document.querySelectorAll(".btn-delete").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      const codigo = this.dataset.id;
      const nombre = this.closest("tr").querySelector(".td-name").textContent;
      const ok = await confirmar('Eliminar producto "' + nombre + '" (' + codigo + ')?');
      if (!ok) return;
      fetch("/producto/" + codigo, { method: "DELETE", headers: { "X-CSRFToken": document.querySelector('meta[name="csrf-token"]').getAttribute("content") } }).then(function (r) {
        if (r.ok) location.reload();
        else r.json().then(function (data) { showToast(data.msg, "error"); });
      });
    });
  });

  document.querySelectorAll(".btn-edit").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const codigo = this.dataset.id;
      fetch("/api/producto/" + codigo)
        .then(function (r) { return r.json(); })
        .then(function (p) {
          if (typeof cargarProducto === "function") {
            document.querySelector(".productos-grid").scrollIntoView({ behavior: "smooth" });
            cargarProducto(p);
          }
        });
    });
  });
}
