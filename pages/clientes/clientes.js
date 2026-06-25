function initClientes() {
  if (typeof initNuevoCliente === 'function') initNuevoCliente();
  if (typeof initTablaClientes === 'function') initTablaClientes();
}

document.addEventListener("DOMContentLoaded", initClientes);
