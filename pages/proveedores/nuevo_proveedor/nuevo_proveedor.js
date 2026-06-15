function initNuevoProveedor() {
  const el = document.getElementById("widget-nuevo-proveedor");
  if (!el) return;

  document.getElementById("pr-save").addEventListener("click", guardarProveedor);
  document.getElementById("pr-cancel-edit").addEventListener("click", cancelarEdicion);
}

function cargarProveedor(p) {
  document.getElementById("pr-ruc").value = p.ruc;
  document.getElementById("pr-ruc").disabled = true;
  document.getElementById("pr-nombre").value = p.nombre;
  document.getElementById("pr-tel").value = p.telefono || "";
  document.getElementById("pr-dir").value = p.direccion || "";

  document.querySelector(".card-title").textContent = "Editar Proveedor";
  document.getElementById("pr-save").textContent = "Guardar cambios";
  document.getElementById("pr-cancel-edit").style.display = "inline-block";
  document.getElementById("widget-nuevo-proveedor").dataset.editId = p.id;
}

function cancelarEdicion() {
  document.getElementById("pr-ruc").disabled = false;
  document.getElementById("pr-ruc").value = "";
  document.getElementById("pr-nombre").value = "";
  document.getElementById("pr-tel").value = "";
  document.getElementById("pr-dir").value = "";

  document.querySelector(".card-title").textContent = "Nuevo Proveedor";
  document.getElementById("pr-save").textContent = "Guardar proveedor";
  document.getElementById("pr-cancel-edit").style.display = "none";
  delete document.getElementById("widget-nuevo-proveedor").dataset.editId;
}

async function guardarProveedor() {
  const editId = document.getElementById("widget-nuevo-proveedor").dataset.editId;

  const datos = sanitizarYValidar({
    ruc: document.getElementById("pr-ruc").value,
    nombre: document.getElementById("pr-nombre").value,
    telefono: document.getElementById("pr-tel").value,
    direccion: document.getElementById("pr-dir").value,
  }, {
    ruc: !editId ? { obligatorio: true, tipo: "ruc", mensaje: "El RUC es obligatorio y debe contener solo dígitos." } : {},
    nombre: { obligatorio: true, mensaje: "El nombre del proveedor es obligatorio." },
  });
  if (!datos) return;

  const url = editId ? "/proveedor/" + editId + "/editar" : "/add_provider";

  await postForm(
    url,
    datos,
    () => {
      showToast(editId ? "Proveedor actualizado" : "Proveedor registrado correctamente", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
