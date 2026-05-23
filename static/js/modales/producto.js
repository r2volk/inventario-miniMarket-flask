// Modal para agregar un nuevo producto
function openAddProduct() {
  // Construimos el HTML completo del modal como una plantilla literal
  const html = `
    <div class="overlay"></div>

    <div class="modal">
      <div class="modal-header">
        <div>
          <span class="modal-kicker">Catálogo</span>
          <h3>Nuevo Producto</h3>
          <p class="modal-desc">
            Completa los datos para registrar un producto al inventario.
          </p>
        </div>

        <button
          class="modal-close"
          type="button"
          data-modal-close
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div class="modal-body form-grid">

        <div class="row">
          <label>Código *</label>
          <input id="p-codigo" placeholder="Ej: ARR001">
        </div>

        <div class="row">
          <label>Nombre *</label>
          <input id="p-nombre" placeholder="Ej: Arroz Extra">
        </div>

        <div class="row row--full">
          <label>Categoría</label>

          <select id="p-cat">
            <option value="Frutas y Verduras">Frutas y Verduras</option>
            <option value="Carnes">Carnes</option>
            <option value="Panadería">Panadería</option>
            <option value="Congelados">Congelados</option>
            <option value="Enlatados">Enlatados</option>
            <option value="Granos y Cereales">Granos y Cereales</option>
            <option value="Pastas">Pastas</option>
            <option value="Aceites">Aceites</option>
            <option value="Condimentos">Condimentos</option>
            <option value="Botanas">Botanas</option>
            <option value="Café">Café</option>
            <option value="Té">Té</option>
            <option value="Jugos">Jugos</option>
            <option value="Agua">Agua</option>
            <option value="Bebidas Energéticas">Bebidas Energéticas</option>
            <option value="Cuidado Personal">Cuidado Personal</option>
            <option value="Higiene Personal">Higiene Personal</option>
            <option value="Productos para Bebé">Productos para Bebé</option>
            <option value="Mascotas">Mascotas</option>
            <option value="Papel y Desechables">Papel y Desechables</option>
            <option value="Utensilios de Cocina">Utensilios de Cocina</option>
            <option value="Papelería">Papelería</option>
            <option value="Ferretería">Ferretería</option>
            <option value="Ropa">Ropa</option>
            <option value="Comida Preparada">Comida Preparada</option>
          </select>
        </div>

        <div class="row">
          <label>P. Compra (S/)</label>

          <input
            id="p-pcompra"
            type="number"
            min="0"
            step="0.10"
            value="0.00"
          >
        </div>

        <div class="row">
          <label>P. Venta (S/)</label>

          <input
            id="p-pventa"
            type="number"
            min="0"
            step="0.10"
            value="0.00"
          >
        </div>

        <div class="row">
          <label>Stock mínimo</label>

          <input
            id="p-stockmin"
            type="number"
            min="0"
            value="5"
          >
        </div>

        <div class="row row--full">
          <label>Descripción</label>

          <input
            id="p-desc"
            placeholder="Opcional"
          >
        </div>

      </div>

      <div class="actions modal-actions">
        <button id="p-cancel" class="btn btn-ghost">
          Cancelar
        </button>

        <button id="p-save" class="btn btn-dark">
          Guardar producto
        </button>
      </div>
    </div>
  `;

  // abrirModal() está definida en utils.js
  abrirModal(html);

  // Botón cancelar
  document.getElementById("p-cancel").addEventListener("click", cerrarModal);

  // Botón guardar
  document.getElementById("p-save").addEventListener("click", guardarProducto);
}

// Lee los valores del formulario y los envía via POST a Flask
async function guardarProducto() {
  const data = {
    codigo: document.getElementById("p-codigo").value,
    nombre: document.getElementById("p-nombre").value,
    categoria: document.getElementById("p-cat").value,
    precio_compra: document.getElementById("p-pcompra").value,
    precio_venta: document.getElementById("p-pventa").value,
    stock_min: document.getElementById("p-stockmin").value,
    descripcion: document.getElementById("p-desc").value,
  };

  // postForm() está en utils.js
  await postForm(
    "/add_product",
    data,

    () => {
      showToast("Producto registrado correctamente", "success");

      cerrarModal();

      setTimeout(() => {
        location.reload();
      }, 1200);
    },

    (msg) => {
      showToast(msg, "error");
    },
  );
}

// Función para eliminar un producto
document.querySelectorAll(".btn-delete").forEach((boton) => {
  boton.addEventListener("click", function () {
    const codigoEliminar = this.dataset.id;

    fetch(`/producto/${codigoEliminar}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        location.reload();
      }
    });
  });
});
