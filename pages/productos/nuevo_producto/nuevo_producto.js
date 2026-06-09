function initNuevoProducto() {
  const el = document.getElementById("widget-nuevo-producto");
  if (!el) return;

  document.getElementById("p-save").addEventListener("click", guardarProducto);
}

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

  await postForm(
    "/add_product",
    data,
    () => {
      showToast("Producto registrado correctamente", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
