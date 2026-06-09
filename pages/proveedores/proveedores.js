function initProveedores() {
  if (typeof initNuevoProveedor === 'function') initNuevoProveedor();
}

document.addEventListener("DOMContentLoaded", initProveedores);
