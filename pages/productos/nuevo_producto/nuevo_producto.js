function initNuevoProducto() {
  const el = document.getElementById("widget-nuevo-producto");
  if (!el) return;

  document.getElementById("p-save").addEventListener("click", guardarProducto);
}

async function guardarProducto() {
  const datos = sanitizarYValidar({
    codigo: document.getElementById("p-codigo").value,
    nombre: document.getElementById("p-nombre").value,
    categoria: document.getElementById("p-cat").value,
    precio_compra: document.getElementById("p-pcompra").value,
    precio_venta: document.getElementById("p-pventa").value,
    stock_min: document.getElementById("p-stockmin").value,
    descripcion: document.getElementById("p-desc").value,
  }, {
    codigo: { obligatorio: true, mensaje: "El código del producto es obligatorio." },
    nombre: { obligatorio: true, mensaje: "El nombre del producto es obligatorio." },
    precio_compra: { tipo: "numero", mensaje: "El precio de compra debe ser un número válido." },
    precio_venta: { tipo: "numero", mensaje: "El precio de venta debe ser un número válido." },
    stock_min: { tipo: "entero", mensaje: "El stock mínimo debe ser un número entero." },
  });
  if (!datos) return;

  await postForm(
    "/add_product",
    datos,
    () => {
      showToast("Producto registrado correctamente", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
