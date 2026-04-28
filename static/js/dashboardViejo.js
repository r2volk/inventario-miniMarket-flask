
//Carga y renderiza el panel de estadísticas
async function loadDashboard() {
  const ctx = document.getElementById("myChart");
  // Busca el canvas donde se dibujará el gráfico

  if (!ctx) return;
  // Si no existe el elemento, se detiene la función

  try {
    const res = await fetch("/api/dashboard");
    // Hace una petición al servidor para obtener los datos del dashboard

    const data = await res.json();
    // Convierte la respuesta en formato JSON (objeto usable en JS)

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      // Busca un elemento por su id

      if (el) {
        el.textContent = val;
        // Si existe, actualiza su texto con el valor recibido
      }
    };

    setVal("dash-total", data.total);
    setVal("dash-alertas", data.alertas);
    setVal("dash-valor", "S/ " + data.valor.toFixed(2));
    setVal("dash-vencimiento", data.vencimiento);
    // Actualiza los distintos campos del dashboard con los datos recibidos

    const colors = [
      "#3b82f6", "#22c55e", "#f59e0b", "#ef4444",
      "#8b5cf6", "#14b8a6", "#f97316", "#ec4899"
    ];
    // Lista de colores que se usarán en el gráfico

    new Chart(ctx, {
      type: "doughnut",
      // Tipo de gráfico circular (tipo dona)

      data: {
        labels: data.chart_labels,
        // Etiquetas del gráfico (nombres de cada parte)

        datasets: [{
          data: data.chart_values,
          // Valores numéricos del gráfico

          backgroundColor: colors.slice(0, data.chart_labels.length),
          // Usa solo los colores necesarios según la cantidad de datos

          borderWidth: 0,
          // Sin bordes entre secciones

          hoverOffset: 4,
          // Separación ligera al pasar el mouse
        }],
      },

      options: {
        responsive: true,
        // Se adapta al tamaño de la pantalla

        maintainAspectRatio: false,
        // Permite que el gráfico se ajuste libremente al contenedor

        cutout: "68%",
        // Tamaño del centro vacío (forma de dona)

        plugins: {
          legend: {
            position: "bottom",
            // Leyenda abajo del gráfico

            labels: {
              padding: 14,
              // Espacio entre elementos de la leyenda

              font: { family: "'Geist', sans-serif", size: 12 },
              // Fuente y tamaño del texto

              color: "#6b7280",
              // Color del texto

              boxWidth: 10,
              boxHeight: 10,
              // Tamaño de los cuadritos de color

              borderRadius: 3,
              // Bordes redondeados

              usePointStyle: true,
              pointStyle: "circle",
              // Usa círculos en lugar de cuadrados
            },
          },
        },
      },
    });

  } catch (e) {
    console.error("Error al cargar el dashboard:", e);
    // Si algo falla (red, servidor, etc.), muestra el error en consola
  }
}
