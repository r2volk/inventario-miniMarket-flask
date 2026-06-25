function buildActivityRows(items) {
  if (!items || items.length === 0) {
    return '<div class="activity-empty">No hay movimientos recientes.</div>';
  }
  return items.map(i => {
    const dotClass = i.tipo === 'Entrada' ? 'activity-dot--in' : 'activity-dot--out';
    const label = i.tipo === 'Entrada' ? 'Entrada registrada' : 'Salida procesada';
    return `
      <div class="activity-item">
        <span class="activity-dot ${dotClass}"></span>
        <div class="activity-item-body">
          <strong>${label}</strong>
          <p>${i.producto} · ${i.cantidad} uds · ${i.motivo}</p>
          <span class="activity-meta">${i.fecha} · ${i.usuario}</span>
        </div>
      </div>`;
  }).join('');
}

function buildTopRows(items) {
  if (!items || items.length === 0) {
    return '<div class="top-empty">No hay ventas registradas aún.</div>';
  }
  return items.map((p, i) => {
    const rank = i + 1;
    const medal = rank <= 3 ? 'top-medal' : '';
    return `
      <div class="top-item ${medal}">
        <span class="top-rank">#${rank}</span>
        <div class="top-item-body">
          <strong>${p.nombre}</strong>
          <span class="top-meta">${p.codigo} · ${p.total_vendido} vendidos · S/ ${parseFloat(p.precio_venta).toFixed(2)}</span>
        </div>
      </div>`;
  }).join('');
}

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("hero-activity");
  if (btn) btn.addEventListener("click", openActivityModal);
});

async function openActivityModal() {
  let activityData = [];
  let topData = [];
  try {
    const [actRes, topRes] = await Promise.all([
      fetch("/api/recent-activity"),
      fetch("/api/top-products"),
    ]);
    activityData = await actRes.json();
    topData = await topRes.json();
  } catch (e) {
    /* no-op */
  }

  const template = document.getElementById("activity-modal-template");
  const clone = template.content.cloneNode(true);

  const list = clone.getElementById("modal-activity-list");
  list.innerHTML = buildActivityRows(activityData);

  const topList = clone.getElementById("modal-top-list");
  topList.innerHTML = buildTopRows(topData);

  const root = document.getElementById("modal-root");
  root.innerHTML = "";
  root.appendChild(clone);
}