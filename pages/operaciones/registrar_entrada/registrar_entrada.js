async function initRegistrarEntrada() {
  const el = document.getElementById("widget-registrar-entrada");
  if (!el) return;

  try {
    const [products, providers] = await Promise.all([
      fetch("/api/products").then(r => r.json()),
      fetch("/api/providers").then(r => r.json()),
    ]);

    const prodOpts = buildOptions(products, "id", p => `${p.codigo} - ${p.nombre}`);
    document.getElementById("e-product").innerHTML = prodOpts;

    const provOpts = buildOptions(providers, "id", p => `${p.nombre} (RUC: ${p.ruc})`);
    document.getElementById("e-provider").innerHTML = provOpts;

  } catch (err) {
    showToast("Error cargando datos: " + err.message, "error");
  }

  document.getElementById("e-save").addEventListener("click", guardarEntrada);
}


async function guardarEntrada() {
  const datos = sanitizarYValidar({
    producto_id:  document.getElementById("e-product").value,
    proveedor_id: document.getElementById("e-provider").value,
    cantidad:     document.getElementById("e-cant").value,
    vencimiento:  document.getElementById("e-venc").value,
    usuario:      document.getElementById("e-user").value,
    motivo:       document.getElementById("e-mot").value,
  }, {
    producto_id: { obligatorio: true, mensaje: "Debes seleccionar un producto." },
    proveedor_id: { obligatorio: true, mensaje: "Debes seleccionar un proveedor." },
    cantidad: { obligatorio: true, tipo: "entero", mensaje: "La cantidad debe ser un número entero mayor a 0." },
  });
  if (!datos) return;

  await postForm(
    "/add_entry",
    datos,
    () => {
      showToast("Entrada registrada. Stock actualizado.", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
