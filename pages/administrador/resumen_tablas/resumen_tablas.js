async function initResumenTablas() {
  const el = document.querySelector(".resumen-grid");
  if (!el) return;

  try {
    const [products, providers] = await Promise.all([
      fetch("/api/products").then(r => r.json()),
      fetch("/api/providers").then(r => r.json()),
    ]);

    const prodTbody = document.querySelector("#mini-productos-table tbody");
    if (prodTbody) {
      prodTbody.innerHTML = products.map(p => `
        <tr>
          <td><code class="code-cell">${p.codigo}</code></td>
          <td class="td-name">${p.nombre}</td>
          <td><span class="stock-badge">${p.stock}</span></td>
        </tr>
      `).join('');
    }

    const provTbody = document.querySelector("#mini-proveedores-table tbody");
    if (provTbody) {
      provTbody.innerHTML = providers.map(p => `
        <tr>
          <td class="td-name">${p.nombre}</td>
          <td><code class="code-cell">${p.ruc}</code></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.error("Error cargando resumen:", e);
  }
}
