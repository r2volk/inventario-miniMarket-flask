function initNuevoProducto() {
  const el = document.getElementById("widget-nuevo-producto");
  if (!el) return;

  cargarCategorias();
  document.getElementById("btn-add-cat").addEventListener("click", agregarCategoria);
  document.getElementById("p-save").addEventListener("click", guardarProducto);
  document.getElementById("p-cancel-edit").addEventListener("click", cancelarEdicion);
}

async function cargarCategorias() {
  try {
    const res = await fetch("/api/categorias");
    const cats = await res.json();
    const select = document.getElementById("p-cat");
    select.innerHTML = '<option value="">Seleccionar</option>'
      + cats.map((c) => `<option value="${c}">${c}</option>`).join("");
  } catch {
    showToast("Error al cargar categorías", "error");
  }
}

async function agregarCategoria() {
  const nombre = prompt("Nombre de la nueva categoría:");
  if (!nombre) return;

  try {
    const res = await fetch("/add_categoria", {
      method: "POST",
      body: new URLSearchParams({ nombre }),
    });
    const data = await res.json();
    if (data.ok) {
      await cargarCategorias();
      document.getElementById("p-cat").value = nombre;
      showToast(data.msg, "success");
    } else {
      showToast(data.msg, "error");
    }
  } catch {
    showToast("Error al crear categoría", "error");
  }
}

function cargarProducto(p) {
  document.getElementById("p-codigo").value = p.codigo;
  document.getElementById("p-codigo").disabled = true;
  document.getElementById("p-nombre").value = p.nombre;
  document.getElementById("p-cat").value = p.categoria;
  document.getElementById("p-pcompra").value = p.precio_compra;
  document.getElementById("p-pventa").value = p.precio_venta;
  document.getElementById("p-stockmin").value = p.stock_min;
  document.getElementById("p-desc").value = p.descripcion || "";

  document.querySelector(".card-title").textContent = "Editar Producto";
  document.getElementById("p-save").textContent = "Guardar cambios";
  document.getElementById("p-cancel-edit").style.display = "inline-block";
  document.getElementById("widget-nuevo-producto").dataset.editCodigo = p.codigo;
}

function cancelarEdicion() {
  document.getElementById("p-codigo").disabled = false;
  document.getElementById("p-codigo").value = "";
  document.getElementById("p-nombre").value = "";
  document.getElementById("p-cat").value = "";
  document.getElementById("p-pcompra").value = "0.00";
  document.getElementById("p-pventa").value = "0.00";
  document.getElementById("p-stockmin").value = "5";
  document.getElementById("p-desc").value = "";

  document.querySelector(".card-title").textContent = "Nuevo Producto";
  document.getElementById("p-save").textContent = "Guardar producto";
  document.getElementById("p-cancel-edit").style.display = "none";
  delete document.getElementById("widget-nuevo-producto").dataset.editCodigo;
}

async function guardarProducto() {
  const editCodigo = document.getElementById("widget-nuevo-producto").dataset.editCodigo;

  const datos = sanitizarYValidar({
    codigo: document.getElementById("p-codigo").value,
    nombre: document.getElementById("p-nombre").value,
    categoria: document.getElementById("p-cat").value,
    precio_compra: document.getElementById("p-pcompra").value,
    precio_venta: document.getElementById("p-pventa").value,
    stock_min: document.getElementById("p-stockmin").value,
    descripcion: document.getElementById("p-desc").value,
  }, {
    codigo: !editCodigo ? { obligatorio: true, mensaje: "El código del producto es obligatorio." } : {},
    nombre: { obligatorio: true, mensaje: "El nombre del producto es obligatorio." },
    precio_compra: { tipo: "numero", mensaje: "El precio de compra debe ser un número válido." },
    precio_venta: { tipo: "numero", mensaje: "El precio de venta debe ser un número válido." },
    stock_min: { tipo: "entero", mensaje: "El stock mínimo debe ser un número entero." },
  });
  if (!datos) return;

  const url = editCodigo ? "/producto/" + editCodigo + "/editar" : "/add_product";

  await postForm(
    url,
    datos,
    () => {
      showToast(editCodigo ? "Producto actualizado" : "Producto registrado correctamente", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
