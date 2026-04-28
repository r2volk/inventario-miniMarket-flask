// Modal para agregar un nuevo proveedor
function openAddProvider() {
  const html = `
    <div class="overlay"></div>
    <div class="modal">
      <h3>Nuevo Proveedor</h3>
      <p class="modal-desc">Registra los datos del proveedor para futuras entradas de stock.</p>
      <div class="row"><label>RUC / DNI *</label><input id="pr-ruc" placeholder="20601234567"></div>
      <div class="row"><label>Razón Social *</label><input id="pr-nombre" placeholder="Empresa S.A.C."></div>
      <div class="row"><label>Teléfono</label><input id="pr-tel" placeholder="01-234-5678"></div>
      <div class="row"><label>Dirección</label><input id="pr-dir" placeholder="Av. Principal 123"></div>
      <div class="actions">
        <button id="pr-cancel" class="btn">Cancelar</button>
        <button id="pr-save" class="btn primary">Guardar proveedor</button>
      </div>
    </div>`;

  // Inyecta el modal en #modal-root usando la función de utils.js
  abrirModal(html);

  document.getElementById("pr-cancel").addEventListener("click", cerrarModal);

  document.getElementById("pr-save").addEventListener("click", guardarProveedor);
}

//guardar proveedor
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
      // A diferencia del producto, aquí NO recargamos la página porque el proveedor no aparece en la tabla principal de productos
      cerrarModal();
    },
    (msg) => showToast(msg, "error"),
  );
}
