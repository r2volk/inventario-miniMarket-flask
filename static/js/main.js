// ============================================================
// main.js  —  Lógica del frontend (lo que corre en el navegador)
// JavaScript del lado del cliente: maneja clicks, abre modales,
// y se comunica con el servidor Flask usando fetch() (AJAX)
// ============================================================

// DOMContentLoaded se dispara cuando el HTML ya cargó completamente
// Todo el código está dentro para asegurarse que los elementos existen antes de usarlos
document.addEventListener("DOMContentLoaded", function () {

  // --- REFERENCIAS A ELEMENTOS DEL HTML ---
  // getElementById busca un elemento por su atributo id="..."
  const modalRoot = document.getElementById("modal-root");     // Contenedor donde se inyectan los modales
  const btnAddProduct = document.getElementById("btn-add-product");   // Botón "Agregar Producto"
  const btnAddEntry = document.getElementById("btn-add-entry");       // Botón "Registrar Entrada"
  const btnRefresh = document.getElementById("btn-refresh");          // Botón "Actualizar"
  const searchInput = document.getElementById("search");              // Campo de búsqueda
  const searchBtn = document.getElementById("search-btn");            // Botón de buscar
  const btnAddOutput = document.getElementById("btn-add-output");     // Botón "Registrar Salida"
  const btnAddProvider = document.getElementById("btn-add-provider"); // Botón "Agregar Proveedor"

  // Asignar función al botón de proveedor SOLO si existe en la página
  // (el && evita error si el botón no está en esta vista)
  if (btnAddProvider) btnAddProvider.addEventListener("click", openAddProvider);

  // --- ASIGNAR EVENTOS A LOS BOTONES PRINCIPALES ---
  // addEventListener("click", funcion) → ejecuta la función cuando se hace click
  btnAddProduct.addEventListener("click", openAddProduct);
  btnAddEntry.addEventListener("click", openAddEntry);
  btnRefresh.addEventListener("click", () => location.reload());  // () => ... es una "arrow function" (función anónima corta)
  btnAddOutput.addEventListener("click", openAddOutput);
  searchBtn && searchBtn.addEventListener("click", applySearch);  // Solo si el botón existe


  // ============================================================
  // FUNCIÓN: Filtrar tabla por búsqueda
  // ============================================================
  function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    // .trim() quita espacios al inicio/fin
    // .toLowerCase() convierte a minúsculas para comparar sin importar mayúsculas

    const rows = document.querySelectorAll("#productos-table tbody tr");
    // querySelectorAll acepta selectores CSS y devuelve todos los elementos que coinciden
    // "#productos-table tbody tr" → todas las filas <tr> del <tbody> de la tabla con id="productos-table"

    rows.forEach((r) => {
      // forEach recorre cada fila
      const text = r.textContent.toLowerCase();
      // textContent obtiene todo el texto visible dentro de la fila

      r.style.display = text.indexOf(q) >= 0 ? "" : "none";
      // indexOf(q) busca el texto dentro de la fila; devuelve -1 si no lo encuentra
      // Si lo encuentra (>= 0): display="" (visible), sino: display="none" (oculto)
      // "condicion ? valorSiTrue : valorSiFalse" → operador ternario (if corto)
    });

    // Contar cuántas filas siguen visibles y mostrar el número
    const visible = [...rows].filter((r) => r.style.display !== "none").length;
    // [...rows] convierte NodeList a Array para poder usar .filter()
    // .filter() devuelve solo los elementos que cumplen la condición
    // .length cuenta cuántos quedaron
    document.getElementById("info-count").textContent = "Registros: " + visible;
  }


  // ============================================================
  // FUNCIÓN: Abrir modal para agregar producto
  // ============================================================
  function openAddProduct() {
    // Construimos el HTML del modal como string y lo inyectamos en #modal-root
    // Esto es dinámico: el modal no existe en el HTML original, se crea aquí
    const html = `
      <div class="overlay"></div>
      <div class="modal">
        <h3>Registrar Producto (Minimarket)</h3>
        <div class="row"><label>Código *</label><input id="p-codigo"></div>
        <div class="row"><label>Nombre *</label><input id="p-nombre"></div>
        <div class="row"><label>Categoría</label>
            <select id="p-cat">
                <option value="Abarrotes">Abarrotes</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Golosinas">Golosinas</option>
                <option value="Otros">Otros</option>
            </select>
        </div>
        <div class="row"><label>Precio Compra (S/)</label><input id="p-pcompra" type="number" step="0.10" value="0"></div>
        <div class="row"><label>Precio Venta (S/)</label><input id="p-pventa" type="number" step="0.10" value="0"></div>
        <div class="row"><label>Stock mín.</label><input id="p-stockmin" type="number" value="5"></div>
        <div class="row"><label>Descripción</label><input id="p-desc"></div>
        <div class="actions"><button id="p-save" class="btn primary">Guardar</button><button id="p-cancel" class="btn">Cancelar</button></div>
      </div>`;

    modalRoot.innerHTML = html;
    // innerHTML reemplaza todo el contenido del div con el HTML que construimos

    // Botón cancelar: vacía el modal-root (cierra el modal)
    document
      .getElementById("p-cancel")
      .addEventListener("click", () => (modalRoot.innerHTML = ""));

    // Botón guardar: recoge los datos y los manda al servidor
    document.getElementById("p-save").addEventListener("click", async () => {
      // async → esta función puede usar "await" (esperar respuestas del servidor)
      const data = {
        codigo: document.getElementById("p-codigo").value,
        nombre: document.getElementById("p-nombre").value,
        categoria: document.getElementById("p-cat").value,
        precio_compra: document.getElementById("p-pcompra").value,
        precio_venta: document.getElementById("p-pventa").value,
        stock_min: document.getElementById("p-stockmin").value,
        descripcion: document.getElementById("p-desc").value,
      };

      // fetch() hace una petición HTTP al servidor (como enviar un formulario pero sin recargar)
      const res = await fetch("/add_product", {
        method: "POST",                           // POST = enviar datos (crear/modificar)
        body: new URLSearchParams(data),          // URLSearchParams formatea el objeto como formulario
      });
      // await pausa aquí hasta que el servidor responda

      if (res.ok) {
        // res.ok es true si el código HTTP está entre 200-299 (éxito)
        alert("Producto registrado.");
        location.reload();   // Recarga la página para mostrar el nuevo producto en la tabla
      } else {
        const j = await res.json().catch(() => ({ msg: "Error" }));
        // .json() lee el cuerpo de la respuesta como JSON
        // .catch(() => ...) → si falla el parseo, usa un objeto por defecto
        alert("Error: " + (j.msg || "Error"));
      }
    });
  }


  // ============================================================
  // FUNCIÓN: Abrir modal para agregar proveedor
  // ============================================================
  function openAddProvider() {
    const html = `
      <div class="overlay"></div>
      <div class="modal">
        <h3>Registrar Proveedor</h3>
        <div class="row"><label>RUC/DNI *</label><input id="pr-ruc"></div>
        <div class="row"><label>Razón Social *</label><input id="pr-nombre"></div>
        <div class="row"><label>Teléfono</label><input id="pr-tel"></div>
        <div class="row"><label>Dirección</label><input id="pr-dir"></div>
        <div class="actions"><button id="pr-save" class="btn primary">Guardar</button><button id="pr-cancel" class="btn">Cancelar</button></div>
      </div>`;

    const modalRoot = document.getElementById("modal-root");
    // Esta línea redeclara modalRoot localmente (es redundante, ya está arriba en el scope global)
    // Funciona igual, pero es una pequeña inconsistencia del código original

    modalRoot.innerHTML = html;

    document
      .getElementById("pr-cancel")
      .addEventListener("click", () => (modalRoot.innerHTML = ""));

    document.getElementById("pr-save").addEventListener("click", async () => {
      const data = {
        ruc: document.getElementById("pr-ruc").value,
        nombre: document.getElementById("pr-nombre").value,
        telefono: document.getElementById("pr-tel").value,
        direccion: document.getElementById("pr-dir").value,
      };
      const res = await fetch("/add_provider", {
        method: "POST",
        body: new URLSearchParams(data),
      });
      if (res.ok) {
        alert("Proveedor registrado.");
        modalRoot.innerHTML = "";   // Cierra el modal SIN recargar (el proveedor no aparece en tabla principal)
      } else {
        const j = await res.json().catch(() => ({ msg: "Error" }));
        alert("Error: " + (j.msg || "Error"));
      }
    });
  }


  // ============================================================
  // FUNCIÓN: Abrir modal para registrar entrada (compra/ingreso)
  // ============================================================
  function openAddEntry() {
    // Necesitamos cargar productos Y proveedores antes de mostrar el modal
    // Promise.all ejecuta ambas peticiones EN PARALELO y espera a que ambas terminen
    Promise.all([
      fetch("/api/products").then((r) => r.json()),   // Petición 1: lista de productos
      fetch("/api/providers").then((r) => r.json()),  // Petición 2: lista de proveedores
    ]).then(([products, providers]) => {
      // Cuando ambas terminan, recibimos los resultados en un array
      // Desestructuración: [products, providers] extrae los dos valores del array

      // Construir las opciones del <select> de productos dinámicamente
      const prodOptions = products
        .map(
          (p) => `<option value="${p.id}">${p.codigo} - ${p.nombre}</option>`
          // .map() transforma cada producto en un string HTML de <option>
        )
        .join("");
        // .join("") une todos los strings en uno solo (sin separador)

      // Lo mismo para proveedores
      const provOptions = providers
        .map(
          (p) => `<option value="${p.id}">${p.nombre} (RUC: ${p.ruc})</option>`
        )
        .join("");

      const html = `
        <div class="overlay"></div>
        <div class="modal">
          <h3>Registrar Entrada (Compra)</h3>
          <div class="row"><label>Producto *</label><select id="e-product">${prodOptions}</select></div>
          <div class="row"><label>Proveedor *</label><select id="e-provider">${provOptions}</select></div>
          <div class="row"><label>Cantidad *</label><input id="e-cant" type="number" value="1" min="1"></div>
          <div class="row"><label>Vencimiento</label><input id="e-venc" type="date"></div>
          <div class="row"><label>Responsable</label><input id="e-user" value="Almacenero"></div>
          <div class="row"><label>Motivo</label><input id="e-mot" value="Reposición de Stock"></div>
          <div class="actions"><button id="e-save" class="btn success">Confirmar Ingreso</button><button id="e-cancel" class="btn">Cancelar</button></div>
        </div>`;

      const modalRoot = document.getElementById("modal-root");
      modalRoot.innerHTML = html;

      document
        .getElementById("e-cancel")
        .addEventListener("click", () => (modalRoot.innerHTML = ""));

      document.getElementById("e-save").addEventListener("click", async () => {
        const data = {
          producto_id: document.getElementById("e-product").value,
          proveedor_id: document.getElementById("e-provider").value,
          cantidad: document.getElementById("e-cant").value,
          vencimiento: document.getElementById("e-venc").value,
          usuario: document.getElementById("e-user").value,
          motivo: document.getElementById("e-mot").value,
        };
        const res = await fetch("/add_entry", {
          method: "POST",
          body: new URLSearchParams(data),
        });
        if (res.ok) {
          alert("Entrada registrada.");
          location.reload();
        } else {
          alert("Error al registrar.");
        }
      });
    });
    // Nota: falta un .catch() aquí → si las APIs fallan, no se muestra ningún error al usuario
    // Mejora: agregar .catch(err => alert("Error cargando datos: " + err))
  }


  // ============================================================
  // FUNCIÓN: Abrir modal para registrar salida (venta/egreso)
  // ============================================================
  function openAddOutput() {
    fetch("/api/products")
      .then((r) => r.json())
      .then((products) => {
        // Solo se necesita la lista de productos (no hay proveedor en una venta)

        // Construir opciones mostrando el stock actual de cada producto
        const options = products
          .map(
            (p) =>
              `<option value="${p.id}">${p.nombre} (Stock: ${p.stock})</option>`
          )
          .join("");

        const html = `
        <div class="overlay"></div>
        <div class="modal">
          <h3>Registrar Salida (Venta)</h3>
          <div class="row"><label>Producto *</label><select id="s-product">${options}</select></div>
          <div class="row"><label>Cantidad *</label><input id="s-cant" type="number" value="1" min="1"></div>
          <div class="row"><label>Vendedor</label><input id="s-user" value="Cajero 1"></div>
          <div class="row"><label>Motivo</label>
            <select id="s-mot">
                <option value="Venta al público">Venta al público</option>
                <option value="Consumo interno">Consumo interno</option>
                <option value="Merma/Vencido">Merma/Vencido</option>
                <option value="Devolución">Devolución a Proveedor</option>
            </select>
          </div>
          <div class="actions"><button id="s-save" class="btn primary">Confirmar Salida</button><button id="s-cancel" class="btn">Cancelar</button></div>
        </div>`;

        modalRoot.innerHTML = html;
        // Aquí sí usa la variable modalRoot del scope principal (no la redeclara)

        document
          .getElementById("s-cancel")
          .addEventListener("click", () => (modalRoot.innerHTML = ""));

        document
          .getElementById("s-save")
          .addEventListener("click", async () => {
            const data = {
              producto_id: document.getElementById("s-product").value,
              cantidad: document.getElementById("s-cant").value,
              usuario: document.getElementById("s-user").value,
              motivo: document.getElementById("s-mot").value,
            };
            const res = await fetch("/add_output", {
              method: "POST",
              body: new URLSearchParams(data),
            });
            if (res.ok) {
              alert("Salida registrada. Stock actualizado.");
              location.reload();
            } else {
              const j = await res.json().catch(() => ({ msg: "Error" }));
              alert("Error: " + (j.msg || "Error"));
            }
          });
      });
  }


  // ============================================================
  // FUNCIÓN: Cargar datos del dashboard al iniciar la página
  // ============================================================
  loadDashboard();   // Se llama inmediatamente cuando carga la página

  async function loadDashboard() {
    const ctx = document.getElementById("myChart");
    // ctx es el elemento <canvas> donde se dibujará el gráfico

    if (!ctx) return;
    // Si no existe el canvas (por ejemplo, estamos en la página de historial), no hacer nada

    try {
      const res = await fetch("/api/dashboard");
      // Pide los datos del dashboard al servidor Flask

      const data = await res.json();
      // Convierte la respuesta JSON en un objeto JavaScript

      // Actualizar los números en las tarjetas del dashboard
      document.getElementById("dash-total").textContent = data.total;
      document.getElementById("dash-alertas").textContent = data.alertas;
      document.getElementById("dash-valor").textContent = data.valor.toFixed(2);
      // .toFixed(2) formatea el número con 2 decimales: 1234.5 → "1234.50"

      // Actualizar la tarjeta de vencimientos (verifica que exista primero)
      if (document.getElementById("dash-vencimiento")) {
        document.getElementById("dash-vencimiento").textContent = data.vencimiento;
      }

      // --- CREAR EL GRÁFICO DE BARRAS CON CHART.JS ---
      // Chart.js es una librería externa incluida en el HTML que dibuja gráficos en <canvas>
      new Chart(ctx, {
        type: "bar",   // Tipo de gráfico: barras verticales
        data: {
          labels: data.chart_labels,   // Eje X: nombres de categorías ["Abarrotes", "Bebidas", ...]
          datasets: [
            {
              label: "Productos por Categoría",   // Etiqueta de la leyenda
              data: data.chart_values,             // Eje Y: cantidades [10, 5, ...]
              backgroundColor: "rgba(43, 124, 255, 0.6)",   // Color de relleno de las barras (azul semitransparente)
              borderColor: "rgba(43, 124, 255, 1)",          // Color del borde de las barras
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,           // El gráfico se adapta al tamaño del contenedor
          maintainAspectRatio: false, // Permite controlar el alto con CSS libremente
          scales: {
            y: { beginAtZero: true } // El eje Y siempre empieza en 0
          },
        },
      });
    } catch (e) {
      console.error(e);
      // Si algo falla (servidor caído, JSON inválido, etc.), lo muestra en la consola del navegador
      // Mejora: mostrar un mensaje de error visible al usuario
    }
  }

}); // Fin del DOMContentLoaded
