let chartInstance = null;
let currentGraficoType = "categoria";

function readThemeTokens() {
  const styles = getComputedStyle(document.documentElement);
  return {
    bar: styles.getPropertyValue("--surface-inverse").trim() || "#09090b",
    barHover: styles.getPropertyValue("--surface-inverse-hover").trim() || "#18181b",
    tooltipBg: styles.getPropertyValue("--surface-inverse").trim() || "#09090b",
    tooltipText: styles.getPropertyValue("--surface-inverse-hover").trim() || "#ffffff",
    tooltipBody: styles.getPropertyValue("--text-muted").trim() || "#71717a",
    tooltipBorder: styles.getPropertyValue("--line-strong").trim() || "#27272a",
    axisText: styles.getPropertyValue("--text-muted").trim() || "#71717a",
    grid: styles.getPropertyValue("--line").trim() || "#ececec",
  };
}

async function renderGrafico(tipo = "categoria") {
  const ctx = document.getElementById("myChart");
  if (!ctx) return;
  currentGraficoType = tipo;

  try {
    const res  = await fetch("/api/dashboard");
    const data = await res.json();

    const labels = data[tipo].labels;
    const values = data[tipo].values;
    const theme = readThemeTokens();

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: tipo === "categoria"
            ? "Productos por categoría"
            : "Stock por producto",
          data: values,
          backgroundColor: theme.bar,
          hoverBackgroundColor: theme.barHover,
          borderColor: theme.barHover,
          borderWidth: 0,
          borderRadius: 10,
          borderSkipped: false,
          barPercentage: 0.72,
          categoryPercentage: 0.86,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 650, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipText,
            bodyColor: theme.tooltipBody,
            borderColor: theme.tooltipBorder,
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
              color: theme.axisText,
              font: { family: "'Geist', sans-serif", size: 11, weight: 500 },
              maxRotation: 0,
              autoSkip: true
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: theme.grid },
            border: { display: false },
            ticks: {
              color: theme.axisText,
              font: { family: "'Geist', sans-serif", size: 11 },
              stepSize: 1
            }
          }
        }
      }
    });

  } catch (e) {
    console.error("Error al cargar el gráfico:", e);
  }
}

function initGrafico() {
  const buttons = document.querySelectorAll('.toggle-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrafico(btn.dataset.grafico);
    });
  });
  renderGrafico("categoria");
}

document.addEventListener("themechange", () => {
  if (currentGraficoType) {
    renderGrafico(currentGraficoType);
  }
});
