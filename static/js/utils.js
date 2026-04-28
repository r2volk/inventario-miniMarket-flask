
// Funciones de utilidad compartidas
// Este archivo debe cargarse PRIMERO en el HTML porque los demás archivos dependen de las funciones que define aquí.

// Vacia el contenedor #modal-root, Se usa en los modales al hacer click en "Cancelar"
function cerrarModal() {
  // innerHTML = "" borra todo el contenido HTML dentro del div
  document.getElementById("modal-root").innerHTML = "";

}

// Inyecta HTML en un modal
function abrirModal(html) {
  // Reemplaza cualquier contenido previo con el nuevo modal
  document.getElementById("modal-root").innerHTML = html;
}


function showToast(msg, type = "success") {
  // Buscamos si ya existe un contenedor de toasts en el DOM
  let container = document.querySelector(".toast-container");

  // Si no existe, lo creamos y lo añadimos al body
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Creamos el elemento individual del toast
  const toast = document.createElement("div");

  // Asignamos clases dinámicas según el tipo (success, error, etc.)
  toast.className = `toast ${type}`;

  // Insertamos el mensaje de texto
  toast.textContent = msg;

  // Añadimos el toast al contenedor
  container.appendChild(toast);

  // Después de 3 segundos, iniciamos la animación de desaparición
  setTimeout(() => {
    // Aplicamos transición y cambiamos opacidad
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";

    // Una vez termina la animación, eliminamos el elemento del DOM
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Envia el formulario al servidor.
//   url    → ruta del servidor Flask (ej: "/add_product")
//   data   → objeto con los datos del formulario (ej: { nombre: "Arroz", stock: 10 })
//   onOk   → función que se ejecuta si el servidor responde con éxito (código 200-299)
//   onError → función que se ejecuta si hay error (opcional)
async function postForm(url, data, onOk, onError) {

  try {
    // fetch() hace la petición HTTP al servidor Flask
    const res = await fetch(url, {
      method: "POST",
      body: new URLSearchParams(data),
      // URLSearchParams convierte el objeto en formato de formulario:
      // { nombre: "Arroz", stock: 10 } → "nombre=Arroz&stock=10"
      // Flask lo lee con request.form.get(...)
    });

    if (res.ok) {
      // res.ok es true cuando el código HTTP está entre 200 y 299 (éxito)
      onOk && onOk();
      // onOk && onOk() → si se pasó una función onOk, la ejecuta
      // El && evita error si onOk es undefined
    } else { // El servidor respondió con un error (400, 404, 500, etc.)
      const j = await res.json().catch(() => ({ msg: "Error desconocido" }));
      // res.json() lee el cuerpo de la respuesta como JSON
      // .catch() maneja el caso en que el cuerpo no sea JSON válido

      const msg = j.msg || "Error desconocido";
      onError ? onError(msg) : alert("Error: " + msg);
      // Si se pasó onError, la llama con el mensaje
      // Si no, muestra un alert genérico
    }
  } catch (e) {
    // catch captura errores de red (servidor caído, sin conexión, etc.)
    const msg = "Error de red: " + e.message;
    onError ? onError(msg) : alert(msg);
  }
}



// Construye opciones HTML para un <select>
// Convierte un array de objetos en un solo string con <option>
function buildOptions(items, valueKey, labelFn) {

  return items
    // Recorre cada elemento del array "items"
    .map((item) => {

      // valueKey es el nombre de la propiedad que usaremos como value
      // Ejemplo: si valueKey = "id", entonces item[valueKey] = item.id
      const value = item[valueKey];

      // labelFn es una función que decide qué texto se mostrará en pantalla
      // Ejemplo: (item) => item.nombre
      const label = labelFn(item);

      // Convertimos cada objeto en un <option> HTML
      return `<option value="${value}">${label}</option>`;
    })

    // Ahora tenemos un array de strings HTML
    // Lo unimos todo en un solo string sin separadores
    .join("");
}
