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

async function openActivityModal() {
  let data = [];
  try {
    const res = await fetch("/api/recent-activity");
    data = await res.json();
  } catch (e) {
    /* no-op, empty list will show fallback */
  }

  const rows = buildActivityRows(data);

  const html = `
    <div class="overlay"></div>

    <div class="modal modal--wide modal--activity">
      <div class="modal-header">
        <div>
          <h3>Actividad Reciente</h3>
          <p class="modal-desc">Últimos movimientos y estado del inventario.</p>
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

        <article class="card inventory-health-card">
          <div class="card-header card-header--compact">
            <div>
              <h3 class="card-title">Pulso del inventario</h3>
              <p class="card-subtitle">Indicadores visuales de seguimiento</p>
            </div>
          </div>
          <div class="health-list">
            <div class="health-item">
              <div class="health-row">
                <span>Stock saludable</span>
                <strong>82%</strong>
              </div>
              <div class="health-track"><span style="width: 82%"></span></div>
            </div>
            <div class="health-item">
              <div class="health-row">
                <span>Rotación semanal</span>
                <strong>64%</strong>
              </div>
              <div class="health-track"><span style="width: 64%"></span></div>
            </div>
            <div class="health-item">
              <div class="health-row">
                <span>Riesgo de quiebre</span>
                <strong>18%</strong>
              </div>
              <div class="health-track health-track--danger"><span style="width: 18%"></span></div>
            </div>
            <div class="health-item">
              <div class="health-row">
                <span>Productos sin stock</span>
                <strong>7%</strong>
              </div>
              <div class="health-track health-track--danger"><span style="width: 7%"></span></div>
            </div>
          </div>
        </article>
      </div>
    </div>
  `;

  abrirModal(html);
}