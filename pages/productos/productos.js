function initProductos() {
  if (typeof initTablaProductos === 'function') initTablaProductos();
  if (typeof initNuevoProducto === 'function') initNuevoProducto();
}

document.addEventListener("DOMContentLoaded", initProductos);
