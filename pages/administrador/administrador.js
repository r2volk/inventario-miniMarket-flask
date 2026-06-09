function initDashboard() {
  if (typeof initGrafico === 'function') initGrafico();
  if (typeof initKpiCards === 'function') initKpiCards();
  if (typeof initResumenTablas === 'function') initResumenTablas();
}

document.addEventListener("DOMContentLoaded", initDashboard);