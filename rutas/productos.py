import sqlite3

from flask import Blueprint, jsonify, render_template, request, current_app

from models.db import get_db

productos_bp = Blueprint("productos", __name__)


@productos_bp.route("/")
def index():
    conn = get_db()
    productos = conn.execute("SELECT * FROM productos ORDER BY nombre").fetchall()
    conn.close()
    return render_template(
        "pages/administrador/administrador.html", productos=productos
    )


@productos_bp.route("/productos")
def productos_page():
    conn = get_db()
    productos = conn.execute("SELECT * FROM productos ORDER BY nombre").fetchall()
    categorias = conn.execute(
        "SELECT nombre FROM categorias ORDER BY nombre"
    ).fetchall()
    conn.close()
    return render_template(
        "pages/productos/productos.html",
        productos=productos,
        categorias=[c["nombre"] for c in categorias],
    )


@productos_bp.route("/producto/<codigo>", methods=["DELETE"])
def eliminar_producto(codigo):
    conexion = get_db()
    cursor = conexion.execute("DELETE FROM productos WHERE codigo = ?", (codigo,))
    conexion.commit()

    if cursor.rowcount == 0:
        current_app.logger.warning(
            f"Intento de eliminar producto inexistente: {codigo}"
        )
        return jsonify({"ok": False, "msg": "Código no existe"}), 404

    current_app.logger.info(f"Producto eliminado: {codigo}")
    return jsonify({"ok": True, "msg": f"Producto {codigo} eliminado"}), 200


@productos_bp.route("/api/producto/<codigo>")
def obtener_producto(codigo):
    conn = get_db()
    row = conn.execute("SELECT * FROM productos WHERE codigo = ?", (codigo,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"ok": False, "msg": "Producto no encontrado."}), 404
    return jsonify(
        {
            "id": row["id"],
            "codigo": row["codigo"],
            "nombre": row["nombre"],
            "categoria": row["categoria"],
            "precio_compra": row["precio_compra"],
            "precio_venta": row["precio_venta"],
            "stock": row["stock"],
            "stock_min": row["stock_min"],
            "descripcion": row["descripcion"],
        }
    )


@productos_bp.route("/producto/<codigo>/editar", methods=["POST"])
def editar_producto(codigo):
    nombre = request.form.get("nombre", "").strip()
    categoria = request.form.get("categoria", "General").strip()
    stock_min = request.form.get("stock_min", "0").strip()
    descripcion = request.form.get("descripcion", "").strip()
    precio_compra = request.form.get("precio_compra", "0")
    precio_venta = request.form.get("precio_venta", "0")

    if not nombre:
        return jsonify({"ok": False, "msg": "El nombre es obligatorio."}), 400

    try:
        stock_min = int(stock_min)
        precio_compra = float(precio_compra)
        precio_venta = float(precio_venta)
    except ValueError:
        return jsonify({"ok": False, "msg": "Valores numéricos inválidos."}), 400

    if precio_compra < 0 or precio_venta < 0:
        return (
            jsonify({"ok": False, "msg": "Los precios no pueden ser negativos."}),
            400,
        )

    if stock_min < 0:
        return (
            jsonify({"ok": False, "msg": "El stock mínimo no puede ser negativo."}),
            400,
        )

    conn = get_db()
    conn.execute(
        """UPDATE productos
           SET nombre=?, categoria=?, precio_compra=?, precio_venta=?,
               stock_min=?, descripcion=?
           WHERE codigo=?""",
        (
            nombre,
            categoria,
            precio_compra,
            precio_venta,
            stock_min,
            descripcion,
            codigo,
        ),
    )
    conn.commit()
    conn.close()
    current_app.logger.info(f"Producto actualizado: {codigo}")
    return jsonify({"ok": True, "msg": "Producto actualizado."})


@productos_bp.route("/add_product", methods=["POST"])
def add_product():
    codigo = request.form.get("codigo", "").strip()
    nombre = request.form.get("nombre", "").strip()
    categoria = request.form.get("categoria", "General").strip()
    stock_min = request.form.get("stock_min", "0").strip()
    descripcion = request.form.get("descripcion", "").strip()
    precio_compra = request.form.get("precio_compra", "0")
    precio_venta = request.form.get("precio_venta", "0")

    if not codigo or not nombre:
        return jsonify({"ok": False, "msg": "Código y nombre son obligatorios."}), 400

    try:
        stock_min = int(stock_min)
        precio_compra = float(precio_compra)
        precio_venta = float(precio_venta)
    except ValueError:
        return jsonify({"ok": False, "msg": "Valores numéricos inválidos."}), 400

    if precio_compra < 0 or precio_venta < 0:
        return (
            jsonify({"ok": False, "msg": "Los precios no pueden ser negativos."}),
            400,
        )

    if stock_min < 0:
        return (
            jsonify({"ok": False, "msg": "El stock mínimo no puede ser negativo."}),
            400,
        )

    conexion = get_db()
    try:
        conexion.execute(
            """
            INSERT INTO productos
              (codigo, nombre, categoria, precio_compra, precio_venta, stock, stock_min, descripcion)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?)
        """,
            (
                codigo,
                nombre,
                categoria,
                precio_compra,
                precio_venta,
                stock_min,
                descripcion,
            ),
        )
        conexion.commit()
        current_app.logger.info(f"Producto creado: {codigo} - {nombre}")
        return jsonify({"ok": True, "msg": "Producto registrado."})

    except sqlite3.IntegrityError:
        current_app.logger.warning(
            f"Intento de crear producto con código duplicado: {codigo}"
        )
        return jsonify({"ok": False, "msg": "Código ya registrado."}), 400

    finally:
        conexion.close()


@productos_bp.route("/api/categorias")
def listar_categorias():
    conn = get_db()
    rows = conn.execute("SELECT nombre FROM categorias ORDER BY nombre").fetchall()
    conn.close()
    return jsonify([row["nombre"] for row in rows])


@productos_bp.route("/add_categoria", methods=["POST"])
def add_categoria():
    nombre = request.form.get("nombre", "").strip()
    if not nombre:
        return (
            jsonify({"ok": False, "msg": "El nombre de la categoría es obligatorio."}),
            400,
        )

    conn = get_db()
    try:
        conn.execute("INSERT INTO categorias (nombre) VALUES (?)", (nombre,))
        conn.commit()
        current_app.logger.info(f"Categoría creada: {nombre}")
        return jsonify({"ok": True, "msg": f"Categoría '{nombre}' creada."})
    except sqlite3.IntegrityError:
        return jsonify({"ok": False, "msg": "Esa categoría ya existe."}), 400
    finally:
        conn.close()
