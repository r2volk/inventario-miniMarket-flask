
# --- IMPORTACIONES ---
from flask import Flask, render_template, request, redirect, url_for, jsonify
# Flask        → la clase principal para crear la app
# render_template → convierte archivos HTML (templates) en páginas reales
# request      → nos da acceso a los datos que manda el navegador (formularios, etc.)
# redirect     → redirige al usuario a otra URL
# url_for      → genera URLs a partir del nombre de una función (evita escribir rutas a mano)
# jsonify      → convierte diccionarios Python en respuestas JSON (para APIs)

import sqlite3, os, datetime
# sqlite3   → base de datos incluida en Python, no necesita instalación aparte
# os        → para manejar rutas de archivos del sistema operativo
# datetime  → para obtener la fecha y hora actual

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
BASE_DIR = os.path.dirname(__file__)
# __file__ es la ruta de este archivo (app.py)
# dirname() saca solo la carpeta donde está, ej: "/home/usuario/proyecto"

DB_PATH = os.path.join(BASE_DIR, "inventario.db")
# Construye la ruta completa al archivo de la base de datos
# Ejemplo resultado: "/home/usuario/proyecto/inventario.db"
# Usar os.path.join es mejor que escribir "/" a mano porque funciona en Windows y Linux

def get_db():
    # Función auxiliar: abre una conexión a la base de datos SQLite
    conn = sqlite3.connect(DB_PATH)
    # Conecta al archivo .db (lo crea si no existe)

    conn.row_factory = sqlite3.Row
    # Esto hace que los resultados se puedan usar como diccionarios:
    # en vez de row[0], puedes escribir row['nombre'] → mucho más legible

    return conn
    # Devuelve la conexión para usarla en las rutas

# --- CREACIÓN DE LA APP FLASK ---
app = Flask(__name__)
# Crea la aplicación Flask
# __name__ le dice a Flask en qué módulo está corriendo (necesario para encontrar templates/static)

# ============================================================
# RUTAS (ROUTES)
# Cada @app.route(...) define una URL y la función que la maneja.
# Cuando el navegador visita esa URL, Flask ejecuta la función.
# ============================================================

# --- PÁGINA PRINCIPAL ---
@app.route("/")
def index():
    # Esta función responde cuando alguien visita http://localhost:5000/
    conn = get_db()
    productos = conn.execute("SELECT * FROM productos ORDER BY nombre").fetchall()
    # Ejecuta una consulta SQL: trae todos los productos ordenados por nombre
    # fetchall() → devuelve todos los resultados como lista
    conn.close()
    # Siempre hay que cerrar la conexión para liberar recursos

    return render_template("index.html", productos=productos)
    # Renderiza el archivo templates/index.html
    # productos=productos → pasa la lista de productos al HTML para que pueda mostrarlos


# --- AGREGAR PRODUCTO ---
@app.route("/add_product", methods=["POST"])
def add_product():
    # Solo acepta POST (no se puede visitar desde el navegador directamente)
    # El frontend envía los datos del formulario con fetch()

    # Leer cada campo del formulario; si no viene, usar valor por defecto
    codigo = request.form.get("codigo","").strip()       # .strip() quita espacios al inicio/fin
    nombre = request.form.get("nombre","").strip()
    categoria = request.form.get("categoria","General").strip()
    stock_min = request.form.get("stock_min","0").strip()
    descripcion = request.form.get("descripcion","").strip()
    precio_compra = request.form.get("precio_compra","0")
    precio_venta = request.form.get("precio_venta","0")

    # Validación: campos obligatorios
    if not codigo or not nombre:
        return jsonify({"ok":False,"msg":"Código y nombre son obligatorios."}), 400
        # Devuelve JSON con error y código HTTP 400 (Bad Request)

    # Convertir a tipos correctos (los datos del form llegan como texto)
    try:
        stock_min = int(stock_min)
        precio_compra = float(precio_compra)
        precio_venta = float(precio_venta)
    except:
        return jsonify({"ok":False,"msg":"Valores numéricos inválidos."}), 400

    conn = get_db()
    try:
        conn.execute("""
            INSERT INTO productos
            (codigo, nombre, categoria, precio_compra, precio_venta, stock, stock_min, descripcion)
            VALUES (?,?,?,?,?,0,?,?)
        """, (codigo, nombre, categoria, precio_compra, precio_venta, stock_min, descripcion))
        # Los ? son placeholders → SQLite los reemplaza con los valores de la tupla
        # Esto PREVIENE inyección SQL (nunca concatenes strings con datos del usuario)
        # El stock comienza en 0 porque aún no hay entradas registradas

        conn.commit()
        # commit() guarda los cambios en la base de datos (sin esto no se persisten)

        return jsonify({"ok":True,"msg":"Producto registrado."})
        # Respuesta exitosa → el frontend mostrará un alert y recargará la página

    except sqlite3.IntegrityError:
        # IntegrityError ocurre si el código ya existe (tiene restricción UNIQUE en la BD)
        return jsonify({"ok":False,"msg":"Código ya registrado."}), 400
    finally:
        conn.close()
        # finally se ejecuta SIEMPRE, haya error o no → garantiza que la conexión se cierre


# --- AGREGAR ENTRADA (COMPRA / INGRESO DE STOCK) ---
@app.route("/add_entry", methods=["POST"])
def add_entry():
    # Leer datos del formulario
    producto_id = request.form.get("producto_id")
    proveedor_id = request.form.get("proveedor_id")
    cantidad = request.form.get("cantidad")
    vencimiento = request.form.get("vencimiento")   # Fecha de vencimiento del lote
    usuario = request.form.get("usuario","").strip()
    motivo = request.form.get("motivo","").strip()

    # Convertir a enteros
    try:
        producto_id = int(producto_id)
        proveedor_id = int(proveedor_id)
        cantidad = int(cantidad)
    except:
        return jsonify({"ok":False,"msg":"Datos inválidos."}), 400

    if cantidad <= 0:
        return jsonify({"ok":False,"msg":"Cantidad debe ser mayor a 0."}), 400

    # Si no ingresaron fecha de vencimiento, se pone una fecha muy lejana (no perecedero)
    if not vencimiento:
        vencimiento = "2099-12-31"

    fecha = datetime.datetime.now().isoformat(timespec='seconds')
    # Obtiene la fecha y hora actual en formato ISO: "2025-04-20T14:30:00"
    # timespec='seconds' corta los microsegundos

    conn = get_db()
    try:
        conn.execute("""
            INSERT INTO entradas (producto_id, proveedor_id, cantidad, fecha, vencimiento, usuario, motivo)
            VALUES (?,?,?,?,?,?,?)
        """, (producto_id, proveedor_id, cantidad, fecha, vencimiento, usuario, motivo))
        # Registra el movimiento en la tabla 'entradas' (historial)

        conn.execute("UPDATE productos SET stock = stock + ? WHERE id = ?", (cantidad, producto_id))
        # Aumenta el stock del producto en la tabla 'productos'
        # Estas dos operaciones deberían ir en una transacción para evitar inconsistencias
        # (mejora pendiente: usar BEGIN/ROLLBACK explícito)

        conn.commit()
        return jsonify({"ok":True,"msg":"Entrada registrada."})
    except Exception as e:
        return jsonify({"ok":False,"msg":str(e)}), 500
        # 500 = Internal Server Error
    finally:
        conn.close()


# --- API: LISTA DE PRODUCTOS (para los <select> de los modales) ---
@app.route("/api/products")
def api_products():
    # Esta ruta es consumida por el JavaScript del frontend (fetch("/api/products"))
    # No renderiza HTML, devuelve JSON
    conn = get_db()
    productos = conn.execute("SELECT id,codigo,nombre,stock FROM productos ORDER BY nombre").fetchall()
    conn.close()
    data = [dict(x) for x in productos]
    # dict(x) convierte cada Row de SQLite en un diccionario Python normal
    # [dict(x) for x in productos] → list comprehension = forma corta de hacer un bucle for
    return jsonify(data)
    # jsonify convierte la lista de dicts en JSON: [{"id":1,"nombre":"Arroz",...}, ...]


# --- AGREGAR SALIDA (VENTA / EGRESO DE STOCK) ---
@app.route("/add_output", methods=["POST"])
def add_output():
    producto_id = request.form.get("producto_id")
    cantidad = request.form.get("cantidad")
    usuario = request.form.get("usuario","").strip()
    motivo = request.form.get("motivo","").strip()

    try:
        producto_id = int(producto_id)
        cantidad = int(cantidad)
    except:
        return jsonify({"ok":False,"msg":"Datos inválidos."}), 400

    if cantidad <= 0:
        return jsonify({"ok":False,"msg":"Cantidad debe ser mayor a 0."}), 400

    conn = get_db()
    try:
        # PASO 1: Verificar que hay suficiente stock antes de vender
        prod = conn.execute("SELECT stock, nombre FROM productos WHERE id = ?", (producto_id,)).fetchone()
        # fetchone() → devuelve solo la primera fila (o None si no existe)

        if not prod:
            return jsonify({"ok":False,"msg":"Producto no encontrado."}), 404
            # 404 = Not Found

        stock_actual = prod['stock']   # Acceso como diccionario gracias a row_factory
        if cantidad > stock_actual:
            return jsonify({"ok":False,"msg":f"Stock insuficiente. Solo tienes {stock_actual} unidades de {prod['nombre']}."}), 400
            # f"..." → f-string: permite insertar variables dentro del texto con {}

        # PASO 2: Registrar la salida en el historial
        fecha = datetime.datetime.now().isoformat(timespec='seconds')
        conn.execute("INSERT INTO salidas (producto_id,cantidad,fecha,usuario,motivo) VALUES (?,?,?,?,?)",
                     (producto_id,cantidad,fecha,usuario,motivo))

        # PASO 3: Restar el stock del producto
        conn.execute("UPDATE productos SET stock = stock - ? WHERE id = ?", (cantidad, producto_id))

        conn.commit()
        return jsonify({"ok":True,"msg":"Venta/Salida registrada correctamente."})
    except Exception as e:
        return jsonify({"ok":False,"msg":str(e)}), 500
    finally:
        conn.close()


# --- AGREGAR PROVEEDOR ---
@app.route("/add_provider", methods=["POST"])
def add_provider():
    ruc = request.form.get("ruc","").strip()
    nombre = request.form.get("nombre","").strip()
    telefono = request.form.get("telefono","").strip()
    direccion = request.form.get("direccion","").strip()

    if not ruc or not nombre:
        return jsonify({"ok":False,"msg":"RUC y Nombre son obligatorios."}), 400

    conn = get_db()
    try:
        conn.execute("INSERT INTO proveedores (ruc, nombre, telefono, direccion) VALUES (?,?,?,?)",
                     (ruc, nombre, telefono, direccion))
        conn.commit()
        return jsonify({"ok":True,"msg":"Proveedor registrado."})
    except sqlite3.IntegrityError:
        # El RUC tiene restricción UNIQUE en la base de datos
        return jsonify({"ok":False,"msg":"El RUC ya existe."}), 400
    finally:
        conn.close()


# --- API: LISTA DE PROVEEDORES (para el <select> del modal de entrada) ---
@app.route("/api/providers")
def api_providers():
    conn = get_db()
    provs = conn.execute("SELECT id, ruc, nombre FROM proveedores ORDER BY nombre").fetchall()
    conn.close()
    return jsonify([dict(x) for x in provs])


# --- API: DATOS DEL DASHBOARD ---
@app.route("/api/dashboard")
def api_dashboard():
    conn = get_db()

    # Total de productos registrados
    total_productos = conn.execute("SELECT COUNT(*) FROM productos").fetchone()[0]
    # COUNT(*) cuenta todas las filas
    # fetchone()[0] → toma la primera (y única) fila, y de ahí el primer valor

    # Productos con stock en alerta (stock actual <= stock mínimo definido)
    alertas_stock = conn.execute("SELECT COUNT(*) FROM productos WHERE stock <= stock_min").fetchone()[0]

    # Valor total del inventario (suma de: precio_compra × stock de cada producto)
    valor_total = conn.execute("SELECT SUM(stock * precio_compra) FROM productos").fetchone()[0]
    if valor_total is None:
        valor_total = 0   # Si no hay productos, SUM devuelve NULL → lo convertimos a 0

    # Lotes próximos a vencer (en los próximos 30 días)
    hoy = datetime.date.today().isoformat()
    # Fecha de hoy en formato "YYYY-MM-DD"
    limite = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
    # Fecha de hoy + 30 días

    # ⚠️ OJO: Esta query usa f-string en vez de ? → es vulnerable a SQL injection
    # Aquí no es crítico porque las fechas las genera el servidor, no el usuario
    # pero es mala práctica. Debería ser: conn.execute("... WHERE vencimiento <= ? AND ...", (limite, hoy))
    por_vencer = conn.execute(f"SELECT COUNT(*) FROM entradas WHERE vencimiento <= '{limite}' AND vencimiento >= '{hoy}'").fetchone()[0]

    # Datos para el gráfico de barras: cantidad de productos por categoría
    chart_query = conn.execute("SELECT categoria, COUNT(*) as cantidad FROM productos GROUP BY categoria").fetchall()
    # GROUP BY agrupa filas con la misma categoría y cuenta cuántos productos hay en cada una
    conn.close()

    # Separamos las etiquetas (nombres de categorías) de los valores (cantidades)
    labels = [row['categoria'] for row in chart_query]   # Ej: ["Abarrotes", "Bebidas", ...]
    values = [row['cantidad'] for row in chart_query]    # Ej: [10, 5, ...]

    # Devolver todo como JSON para que el JavaScript lo use en el dashboard
    return jsonify({
        "total": total_productos,
        "alertas": alertas_stock,
        "vencimiento": por_vencer,
        "valor": valor_total,
        "chart_labels": labels,
        "chart_values": values
    })


# --- PÁGINA DE HISTORIAL DE MOVIMIENTOS ---
@app.route("/historial")
def historial():
    conn = get_db()

    # UNION ALL combina dos consultas SELECT en una sola tabla de resultados
    # Primera parte: todas las entradas (compras)
    # Segunda parte: todas las salidas (ventas)
    # ORDER BY fecha DESC → los más recientes primero
    query = """
        SELECT 'Entrada' as tipo, e.fecha, p.nombre as producto, e.cantidad, e.usuario, e.motivo
        FROM entradas e
        JOIN productos p ON e.producto_id = p.id
        UNION ALL
        SELECT 'Salida' as tipo, s.fecha, p.nombre as producto, s.cantidad, s.usuario, s.motivo
        FROM salidas s
        JOIN productos p ON s.producto_id = p.id
        ORDER BY fecha DESC
    """
    # JOIN une dos tablas usando una columna en común (producto_id = id)
    # Así podemos mostrar el nombre del producto en vez de solo su ID

    movimientos = conn.execute(query).fetchall()
    conn.close()
    return render_template("historial.html", movimientos=movimientos)


# --- PUNTO DE ENTRADA ---
if __name__ == "__main__":
    # Este bloque solo se ejecuta cuando corres el archivo directamente: python app.py
    # No se ejecuta si otro archivo importa este módulo
    app.run(debug=True, port=5000)
    # debug=True → reinicia el servidor automáticamente al guardar cambios, muestra errores detallados
    # port=5000  → la app corre en http://localhost:5000
    # ⚠️ debug=True nunca debe usarse en producción (expone información interna)
