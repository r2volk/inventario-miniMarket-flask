function initHistorial() {
  if (typeof initTablaMovimientos === 'function') initTablaMovimientos();
}

document.addEventListener("DOMContentLoaded", initHistorial);
