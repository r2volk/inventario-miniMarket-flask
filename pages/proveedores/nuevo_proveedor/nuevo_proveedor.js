function initNuevoProveedor() {
  const el = document.getElementById("widget-nuevo-proveedor");
  if (!el) return;

  document.getElementById("pr-save").addEventListener("click", guardarProveedor);
}

async function guardarProveedor() {
  const data = {
    ruc: document.getElementById("pr-ruc").value,
    nombre: document.getElementById("pr-nombre").value,
    telefono: document.getElementById("pr-tel").value,
    direccion: document.getElementById("pr-dir").value,
  };

  await postForm(
    "/add_provider",
    data,
    () => {
      showToast("Proveedor registrado correctamente", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
