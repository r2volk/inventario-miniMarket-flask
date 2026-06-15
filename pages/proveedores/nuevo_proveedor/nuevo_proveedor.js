function initNuevoProveedor() {
  const el = document.getElementById("widget-nuevo-proveedor");
  if (!el) return;

  document.getElementById("pr-save").addEventListener("click", guardarProveedor);
}

async function guardarProveedor() {
  const datos = sanitizarYValidar({
    ruc: document.getElementById("pr-ruc").value,
    nombre: document.getElementById("pr-nombre").value,
    telefono: document.getElementById("pr-tel").value,
    direccion: document.getElementById("pr-dir").value,
  }, {
    ruc: { obligatorio: true, tipo: "ruc", mensaje: "El RUC es obligatorio y debe contener solo dígitos." },
    nombre: { obligatorio: true, mensaje: "El nombre del proveedor es obligatorio." },
  });
  if (!datos) return;

  await postForm(
    "/add_provider",
    datos,
    () => {
      showToast("Proveedor registrado correctamente", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
