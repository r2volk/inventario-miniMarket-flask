function initTablaProveedores() {
  var PER_PAGE = 10;
  var currentPage = 1;
  var tbody = document.querySelector("#proveedores-table tbody");
  var allRows = Array.from(tbody.querySelectorAll("tr"));
  var totalPages = Math.max(1, Math.ceil(allRows.length / PER_PAGE));
  var paginationEl = document.getElementById("proveedores-pagination");

  function renderPage(page) {
    currentPage = page;
    var start = (page - 1) * PER_PAGE;
    var end = start + PER_PAGE;
    allRows.forEach(function (row, i) {
      row.style.display = (i >= start && i < end) ? "" : "none";
    });
    updatePagination();
  }

  function updatePagination() {
    if (totalPages <= 1) {
      paginationEl.style.display = "none";
      return;
    }
    paginationEl.style.display = "flex";

    var prev = document.getElementById("page-prev");
    var next = document.getElementById("page-next");
    prev.disabled = currentPage <= 1;
    next.disabled = currentPage >= totalPages;

    var container = document.getElementById("page-buttons");
    container.innerHTML = "";
    for (var i = 1; i <= totalPages; i++) {
      var btn = document.createElement("button");
      btn.className = "page-btn" + (i === currentPage ? " active" : "");
      btn.textContent = i;
      btn.addEventListener("click", (function (p) {
        return function () { renderPage(p); };
      })(i));
      container.appendChild(btn);
    }
  }

  document.getElementById("page-prev").addEventListener("click", function () {
    if (currentPage > 1) renderPage(currentPage - 1);
  });

  document.getElementById("page-next").addEventListener("click", function () {
    if (currentPage < totalPages) renderPage(currentPage + 1);
  });

  renderPage(1);

  document.querySelectorAll(".btn-edit").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = this.dataset.id;
      fetch("/api/proveedor/" + id)
        .then(function (r) { return r.json(); })
        .then(function (p) {
          if (typeof cargarProveedor === "function") {
            document.querySelector(".proveedores-grid").scrollIntoView({ behavior: "smooth" });
            cargarProveedor(p);
          }
        });
    });
  });

  document.querySelectorAll(".btn-delete").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var id = this.dataset.id;
      var nombre = this.closest("tr").querySelector(".td-name").textContent;
      var ok = await confirmar('Eliminar proveedor "' + nombre + '"?');
      if (!ok) return;
      fetch("/proveedor/" + id, { method: "DELETE", headers: { "X-CSRFToken": document.querySelector('meta[name="csrf-token"]').getAttribute("content") } }).then(function (r) {
        return r.json();
      }).then(function (data) {
        if (data.ok) {
          showToast(data.msg, "success");
          setTimeout(function () { location.reload(); }, 1200);
        } else {
          showToast(data.msg, "error");
        }
      });
    });
  });
}
