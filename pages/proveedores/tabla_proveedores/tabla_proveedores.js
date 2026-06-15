function initTablaProveedores() {
  document.querySelectorAll(".btn-edit").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = this.dataset.id;
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
      const id = this.dataset.id;
      const nombre = this.closest("tr").querySelector(".td-name").textContent;
      const ok = await confirmar('Eliminar proveedor "' + nombre + '"?');
      if (!ok) return;
      fetch("/proveedor/" + id, { method: "DELETE" }).then(function (r) {
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
