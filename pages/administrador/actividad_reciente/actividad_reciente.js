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

  const rows = buildActivityRows(activityData);
  const topRows = buildTopRows(topData);

  const html = `
    <div class="overlay"></div>

    <div class="modal modal--wide modal--activity">
      <div class="modal-header">
        <div>
          <h3>Actividad Reciente</h3>
          <p class="modal-desc">Últimos movimientos y rotación de productos.</p>
        </div>
        <button class="modal-close" type="button" data-modal-close aria-label="Cerrar">×</button>
      </div>

      <div class="modal-activity-grid">
        <article class="card activity-card">
          <div class="card-header card-header--compact">
            <div>
              <h3 class="card-title">Últimos movimientos</h3>
              <p class="card-subtitle">Entradas y salidas recientes</p>
            </div>
          </div>
          <div class="activity-list" id="modal-activity-list">
            ${rows}
          </div>
        </article>

        <article class="card top-card">
          <div class="card-header card-header--compact">
            <div>
              <h3 class="card-title">⭐ Top 10 más vendidos</h3>
              <p class="card-subtitle">Productos con mayor rotación en el inventario</p>
            </div>
          </div>
          <div class="top-list">
            ${topRows}
          </div>
        </article>
      </div>
    </div>
  `;

  abrirModal(html);
}