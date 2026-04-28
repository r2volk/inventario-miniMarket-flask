
// Modal para registrar una salida (venta)
function openAddOutput() {

  // obtenemos la lista de productos
  fetch("/api/products")
    .then((r) => r.json()) // r.json() convierte la respuesta HTTP en un array de objetos JavaScript

    .then((products) => {
      // Construimos las opciones mostrando el stock actual de cada producto
      const options = buildOptions(
        products,
        "id",
        (p) => `${p.nombre} (Stock: ${p.stock})` // Muestra: "Arroz (Stock: 50)"
      );

      const html = `
        <div class="overlay"></div>
        <div class="modal">
          <h3>Registrar Salida</h3>
          <p class="modal-desc">Egreso de productos por venta o consumo interno.</p>
          <div class="row"><label>Producto *</label><select id="s-product">${options}</select></div>
          <div class="row"><label>Cantidad *</label><input id="s-cant" type="number" value="1" min="1"></div>
          <div class="row"><label>Vendedor</label><input id="s-user" value="Cajero 1"></div>
          <div class="row">
            <label>Motivo</label>
            <select id="s-mot">
              <option value="Venta al público">Venta al público</option>
              <option value="Consumo interno">Consumo interno</option>
              <option value="Merma/Vencido">Merma / Vencido</option>
              <option value="Devolución">Devolución a Proveedor</option>
            </select>
          </div>
          <div class="actions">
            <button id="s-cancel" class="btn">Cancelar</button>
            <button id="s-save" class="btn danger">Confirmar salida</button>
          </div>
        </div>`;

      // Inyecta el modal en #modal-root usando la función de utils.js
      abrirModal(html);

      document.getElementById("s-cancel").addEventListener("click", cerrarModal);

      document.getElementById("s-save").addEventListener("click", guardarSalida);
    })
    .catch((err) => showToast("Error cargando productos: " + err.message, "error"),);
}


// Guardar Salida
async function guardarSalida() {

  const data = {
    producto_id: document.getElementById("s-product").value,
    cantidad:    document.getElementById("s-cant").value,
    usuario:     document.getElementById("s-user").value,
    motivo:      document.getElementById("s-mot").value,
  };

  await postForm(
    "/add_output",
    data,
    () => {
      showToast("Salida registrada. Stock descontado.", "success");
      cerrarModal();
      // Recargamos para reflejar el nuevo stock en la tabla principal
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
    // Flask devuelve mensajes específicos como:
    // "Stock insuficiente. Solo tienes 3 unidades de Arroz."
  );
}
