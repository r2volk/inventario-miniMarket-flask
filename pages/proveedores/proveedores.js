function initProveedores() {
  if (typeof initNuevoProveedor === 'function') initNuevoProveedor();
  if (typeof initTablaProveedores === 'function') initTablaProveedores();
}

document.addEventListener("DOMContentLoaded", initProveedores);
