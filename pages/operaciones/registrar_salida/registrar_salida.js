async function initRegistrarSalida() {
  const el = document.getElementById("widget-registrar-salida");
  if (!el) return;

  try {
    const products = await fetch("/api/products").then(r => r.json());
    const options = buildOptions(products, "id", p => `${p.nombre} (Stock: ${p.stock})`);
    document.getElementById("s-product").innerHTML = options;
  } catch (err) {
    showToast("Error cargando productos: " + err.message, "error");
  }

  document.getElementById("s-save").addEventListener("click", guardarSalida);
}


async function guardarSalida() {
  const datos = sanitizarYValidar({
    producto_id: document.getElementById("s-product").value,
    cantidad:    document.getElementById("s-cant").value,
    usuario:     document.getElementById("s-user").value,
    motivo:      document.getElementById("s-mot").value,
  }, {
    producto_id: { obligatorio: true, mensaje: "Debes seleccionar un producto." },
    cantidad: { obligatorio: true, tipo: "entero", mensaje: "La cantidad debe ser un número entero mayor a 0." },
  });
  if (!datos) return;

  await postForm(
    "/add_output",
    datos,
    () => {
      showToast("Salida registrada. Stock descontado.", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
