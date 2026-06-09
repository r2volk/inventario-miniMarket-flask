function initDashboard() {
  if (typeof initGrafico === 'function') initGrafico();
  if (typeof initKpiCards === 'function') initKpiCards();
  if (typeof initInventarioTabla === 'function') initInventarioTabla();
}

document.addEventListener("DOMContentLoaded", initDashboard);
