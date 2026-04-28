// ============================================================
// dashboard.js — Carga datos del dashboard y renderiza el gráfico
// ============================================================

async function loadDashboard() {
  const ctx = document.getElementById("myChart");
  if (!ctx) return;

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

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.chart_labels,
        datasets: [{
          label: "Productos",
          data: data.chart_values,
          backgroundColor: "#111827",
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111827",
            titleColor: "#ffffff",
            bodyColor: "#9ca3af",
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} productos`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "#9ca3af", font: { family: "'Geist', sans-serif", size: 12 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f3f4f6" },
            border: { display: false },
            ticks: { color: "#9ca3af", font: { family: "'Geist', sans-serif", size: 12 }, stepSize: 1 }
          }
        }
      }
    });

  } catch (e) {
    console.error("Error al cargar el dashboard:", e);
  }
}
