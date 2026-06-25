function initNuevoCliente() {
  const el = document.getElementById("widget-nuevo-cliente");
  if (!el) return;

  document.getElementById("cl-save").addEventListener("click", guardarCliente);
  document.getElementById("cl-cancel-edit").addEventListener("click", cancelarEdicion);
}

function cargarCliente(c) {
  document.getElementById("cl-dni-ruc").value = c.dni_ruc;
  document.getElementById("cl-dni-ruc").disabled = true;
  document.getElementById("cl-nombre").value = c.nombre;
  document.getElementById("cl-tel").value = c.telefono || "";
  document.getElementById("cl-dir").value = c.direccion || "";

  document.querySelector(".card-title").textContent = "Editar Cliente";
  document.getElementById("cl-save").textContent = "Guardar cambios";
  document.getElementById("cl-cancel-edit").style.display = "inline-block";
  document.getElementById("widget-nuevo-cliente").dataset.editId = c.id;
}

function cancelarEdicion() {
  document.getElementById("cl-dni-ruc").disabled = false;
  document.getElementById("cl-dni-ruc").value = "";
  document.getElementById("cl-nombre").value = "";
  document.getElementById("cl-tel").value = "";
  document.getElementById("cl-dir").value = "";

  document.querySelector(".card-title").textContent = "Nuevo Cliente";
  document.getElementById("cl-save").textContent = "Guardar cliente";
  document.getElementById("cl-cancel-edit").style.display = "none";
  delete document.getElementById("widget-nuevo-cliente").dataset.editId;
}

async function guardarCliente() {
  const editId = document.getElementById("widget-nuevo-cliente").dataset.editId;

  const datos = sanitizarYValidar({
    dni_ruc: document.getElementById("cl-dni-ruc").value,
    nombre: document.getElementById("cl-nombre").value,
    telefono: document.getElementById("cl-tel").value,
    direccion: document.getElementById("cl-dir").value,
  }, {
    dni_ruc: !editId ? { obligatorio: true, tipo: "ruc", mensaje: "El DNI/RUC es obligatorio y debe contener solo dígitos." } : {},
    nombre: { obligatorio: true, mensaje: "El nombre del cliente es obligatorio." },
  });
  if (!datos) return;

  const url = editId ? "/cliente/" + editId + "/editar" : "/add_cliente";

  await postForm(
    url,
    datos,
    () => {
      showToast(editId ? "Cliente actualizado" : "Cliente registrado correctamente", "success");
      setTimeout(() => location.reload(), 1200);
    },
    (msg) => showToast(msg, "error"),
  );
}
