function initOperaciones() {
  if (typeof initRegistrarEntrada === 'function') initRegistrarEntrada();
  if (typeof initRegistrarSalida === 'function') initRegistrarSalida();
}

document.addEventListener("DOMContentLoaded", initOperaciones);
