// ============================================================
// dashboard.js — Carga datos del dashboard y renderiza el gráfico
// ============================================================

let chartInstance = null;

async function loadDashboard(tipo = "categoria") {

  const ctx = document.getElementById("myChart");
  if (!ctx) return;

  try {
    const res  = await fetch("/api/dashboard");
    const data = await res.json();

    // MÉTRICAS
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal("dash-total",       data.total);
    setVal("dash-alertas",     data.alertas);
    setVal("dash-valor",       "S/ " + data.valor.toFixed(2));
    setVal("dash-vencimiento", data.vencimiento);

    // DATOS DEL GRÁFICO
    const labels = data[tipo].labels;
    const values = data[tipo].values;

    // DESTRUIR GRÁFICO ANTERIOR
    if (chartInstance) {
      chartInstance.destroy();
    }

    // CREAR NUEVO GRÁFICO
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: tipo === "categoria"
            ? "Productos por categoría"
            : "Stock por producto",

          data: values,
          backgroundColor: "#18181b",
          hoverBackgroundColor: "#000000",
          borderColor: "#000000",
          borderWidth: 0,
          borderRadius: 10,
          borderSkipped: false,
          barPercentage: 0.62,
          categoryPercentage: 0.78,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 650,
          easing: "easeOutQuart"
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#09090b",
            titleColor: "#ffffff",
            bodyColor: "#d4d4d8",
            borderColor: "#27272a",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: (ctx) => {
                return tipo === "categoria"
                  ? ` ${ctx.parsed.y} productos`
                  : ` ${ctx.parsed.y} en stock`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: "#71717a",
              font: { family: "'Geist', sans-serif", size: 11, weight: 500 },
              maxRotation: 0,
              autoSkip: true
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: "#ececec" },
            border: { display: false },
            ticks: {
              color: "#a1a1aa",
              font: { family: "'Geist', sans-serif", size: 11 },
              stepSize: 1
            }
          }
        }
      }
    });

  } catch (e) {
    console.error("Error al cargar el dashboard:", e);
  }
}


function loadDashboard2() {
  const buttons = document.querySelectorAll('.toggle-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadDashboard(btn.dataset.grafico);
    });
  });
  loadDashboard("categoria");
}
