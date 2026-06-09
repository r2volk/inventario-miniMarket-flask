async function loadKpiCards() {
  try {
    const res  = await fetch("/api/dashboard");
    const data = await res.json();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal("dash-total",       data.total);
    setVal("dash-alertas",     data.alertas);
    setVal("dash-valor",       "S/ " + data.valor.toFixed(2));
    setVal("dash-vencimiento", data.vencimiento);
  } catch (e) {
    console.error("Error al cargar KPI:", e);
  }
}

function initKpiCards() {
  loadKpiCards();
}
