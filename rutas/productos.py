import sqlite3

from flask import Blueprint, jsonify, render_template, request, current_app

from models.db import get_db

productos_bp = Blueprint("productos", __name__)


@productos_bp.route("/")
def index():
    conn = get_db()
    productos = conn.execute("SELECT * FROM productos ORDER BY nombre").fetchall()
    conn.close()
    return render_template("pages/administrador/administrador.html", productos=productos)


@productos_bp.route("/productos")
def productos_page():
    conn = get_db()
    productos = conn.execute("SELECT * FROM productos ORDER BY nombre").fetchall()
    conn.close()
    return render_template("pages/productos/productos.html", productos=productos)


@productos_bp.route("/producto/<codigo>", methods=["DELETE"])
def eliminar_producto(codigo):
    conexion = get_db()
    cursor = conexion.execute("DELETE FROM productos WHERE codigo = ?", (codigo,))
    conexion.commit()

    if cursor.rowcount == 0:
        current_app.logger.warning(f"Intento de eliminar producto inexistente: {codigo}")
        return jsonify({"ok": False, "msg": "Código no existe"}), 404

    current_app.logger.info(f"Producto eliminado: {codigo}")
    return jsonify({"ok": True, "msg": f"Producto {codigo} eliminado"}), 200


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
        return jsonify(
            {"ok": False, "msg": "Los precios no pueden ser negativos."}
        ), 400

    if stock_min < 0:
        return jsonify(
            {"ok": False, "msg": "El stock mínimo no puede ser negativo."}
        ), 400

    conexion = get_db()
    try:
        conexion.execute(
            """
            INSERT INTO productos
              (codigo, nombre, categoria, precio_compra, precio_venta, stock, stock_min, descripcion)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?)
        """,
            (codigo, nombre, categoria, precio_compra, precio_venta, stock_min, descripcion),
        )
        conexion.commit()
        current_app.logger.info(f"Producto creado: {codigo} - {nombre}")
        return jsonify({"ok": True, "msg": "Producto registrado."})

    except sqlite3.IntegrityError:
        current_app.logger.warning(f"Intento de crear producto con código duplicado: {codigo}")
        return jsonify({"ok": False, "msg": "Código ya registrado."}), 400

    finally:
        conexion.close()
