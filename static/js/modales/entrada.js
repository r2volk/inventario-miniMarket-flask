
// Modal de entrada para registrar una compra
function openAddEntry() {

  // Promise.all() lanza AMBAS peticiones al mismo tiempo y espera a que las DOS terminen antes de continuar, es más rápido que hacerlas una después de la otra (secuencial).
  Promise.all([
    // fetch() hace un GET a /api/products → devuelve [{id, codigo, nombre, stock}, ...]
    // .then(r => r.json()) convierte la respuesta HTTP en un objeto JavaScript
    fetch("/api/products").then((r) => r.json()),

    // Igual para proveedores..
    fetch("/api/providers").then((r) => r.json()),
  ])
  .then(([products, providers]) => {
    // Cuando ambas peticiones terminaron, recibimos los resultados en [products, providers]
    // El orden corresponde al orden de las peticiones en Promise.all

    // buildOptions() está en utils.js
    // Convierte el array de objetos en un string de <option>s HTML
    const prodOptions = buildOptions(
      products,
      "id", // El value del <option> será el id del producto
      (p) => `${p.codigo} - ${p.nombre}`// El texto visible combina código y nombre
    );

    const provOptions = buildOptions(
      providers,
      "id",
      (p) => `${p.nombre} (RUC: ${p.ruc})`// Muestra nombre y RUC del proveedor
    );

    // Ahora que tenemos las opciones, construimos el HTML del modal
    const html = `
      <div class="overlay"></div>
      <div class="modal">
        <h3>Registrar Entrada (Compra)</h3>
        <p class="modal-desc">Ingreso de mercadería al stock del almacén.</p>
        <div class="row"><label>Producto *</label><select id="e-product">${prodOptions}</select></div>
        <div class="row"><label>Proveedor *</label><select id="e-provider">${provOptions}</select></div>
        <div class="row"><label>Cantidad *</label><input id="e-cant" type="number" value="1" min="1"></div>
        <div class="row"><label>Vencimiento</label><input id="e-venc" type="date"></div>
        <div class="row"><label>Responsable</label><input id="e-user" value="Almacenero"></div>
        <div class="row"><label>Motivo</label><input id="e-mot" value="Reposición de Stock"></div>
        <div class="actions">
          <button id="e-save" class="btn success">Confirmar Ingreso</button>
          <button id="e-cancel" class="btn">Cancelar</button>
        </div>
      </div>`;

    abrirModal(html);

    document.getElementById("e-cancel").addEventListener("click", cerrarModal);

    document.getElementById("e-save").addEventListener("click", guardarEntrada);
  })
  .catch((err) => {
    // .catch() maneja errores de red (servidor caído, JSON inválido, etc.)
    showToast("Error cargando datos: " + err.message, "error");
  });
}


// --- GUARDAR ENTRADA ---
async function guardarEntrada() {

  const data = {
    producto_id:  document.getElementById("e-product").value,
    proveedor_id: document.getElementById("e-provider").value,
    cantidad:     document.getElementById("e-cant").value,
    vencimiento:  document.getElementById("e-venc").value,
    usuario:      document.getElementById("e-user").value,
    motivo:       document.getElementById("e-mot").value,
  };

  //enviamos los datos al backend, esperando su respuesta
  await postForm(
    "/add_entry", // Endpoint al que se envían los datos
    data,         // Objeto con la información del formulario

    // Callback en caso de éxito
    () => {
      // Mostramos un mensaje tipo toast
      showToast("Entrada registrada. Stock actualizado.", "success");
      cerrarModal();// Cerramos el modal del formulario

      // Esperamos 1.2 segundos antes de recargar la página
      setTimeout(() => {
        location.reload(); // Recarga la página para reflejar el nuevo stock
      }, 1200);
    },

    (msg) => {
      // Mostramos el mensaje de error en un toast en caso de error
      showToast(msg, "error");
    }
  );
}
