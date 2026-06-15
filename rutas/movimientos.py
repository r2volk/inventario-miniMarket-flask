import datetime
from flask import Blueprint, render_template, request, jsonify, current_app
from models.db import get_db

movimientos_bp = Blueprint("movimientos", __name__)


@movimientos_bp.route("/add_entry", methods=["POST"])
def add_entry():
    producto_id  = request.form.get("producto_id","")
    proveedor_id = request.form.get("proveedor_id","")
    cantidad     = request.form.get("cantidad","")
    vencimiento  = request.form.get("vencimiento")
    usuario      = request.form.get("usuario", "").strip()
    motivo       = request.form.get("motivo", "").strip()

    try:
        producto_id  = int(producto_id)
        proveedor_id = int(proveedor_id)
        cantidad     = int(cantidad)
    except ValueError:
        return jsonify({"ok": False, "msg": "Datos inválidos."}), 400

    if cantidad <= 0:
        return jsonify({"ok": False, "msg": "Cantidad debe ser mayor a 0."}), 400

    if not vencimiento:
        vencimiento = "2099-12-31"

    fecha = datetime.datetime.now().isoformat(timespec='seconds')

    conexion = get_db()
    try:
        conexion.execute("""
            INSERT INTO entradas
              (producto_id, proveedor_id, cantidad, fecha, vencimiento, usuario, motivo)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (producto_id, proveedor_id, cantidad, fecha, vencimiento, usuario, motivo)
        )
        conexion.execute(
            "UPDATE productos SET stock = stock + ? WHERE id = ?",
            (cantidad, producto_id)
        )
        conexion.commit()
        current_app.logger.info(f"Entrada de stock: +{cantidad} unidades (producto_id={producto_id})")
        return jsonify({"ok": True,"msg": "Entrada registrada."})
    except Exception as e:
        current_app.logger.error(f"Error al registrar entrada: {e}")
        return jsonify({"ok": False,"msg": str(e)}), 500
    finally:
        conexion.close()


@movimientos_bp.route("/add_output", methods=["POST"])
def add_output():
    producto_id = request.form.get("producto_id","")
    cantidad    = request.form.get("cantidad","")
    usuario     = request.form.get("usuario", "").strip()
    motivo      = request.form.get("motivo", "").strip()

    try:
        producto_id = int(producto_id)
        cantidad    = int(cantidad)
    except (TypeError, ValueError):
        return jsonify({"ok": False, "msg": "Datos inválidos."}), 400

    if cantidad <= 0:
        return jsonify({"ok": False, "msg": "Cantidad debe ser mayor a 0."}), 400

    conexion = get_db()
    try:
        producto = conexion.execute(
            "SELECT stock, nombre FROM productos WHERE id = ?",
            (producto_id,)
        ).fetchone()

        if not producto:
            current_app.logger.warning(f"Salida fallida: producto_id={producto_id} no existe")
            return jsonify({"ok": False, "msg": "Producto no encontrado."}), 404

        stockActual = producto['stock']

        if cantidad > stockActual:
            current_app.logger.warning(
                f"Salida fallida: stock insuficiente. "
                f"Producto={producto['nombre']}, solicitado={cantidad}, disponible={stockActual}"
            )
            return jsonify({
                "ok": False,
                "msg": f"Stock insuficiente. Solo tienes {stockActual} unidades de {producto['nombre']}."
            }), 400

        fecha = datetime.datetime.now().isoformat(timespec='seconds')
        conexion.execute(
            "INSERT INTO salidas (producto_id, cantidad, fecha, usuario, motivo) VALUES (?, ?, ?, ?, ?)",
            (producto_id, cantidad, fecha, usuario, motivo)
        )
        conexion.execute(
            "UPDATE productos SET stock = stock - ? WHERE id = ?",
            (cantidad, producto_id)
        )
        conexion.commit()
        current_app.logger.info(f"Salida de stock: -{cantidad} unidades (producto_id={producto_id})")
        return jsonify({"ok": True, "msg": "Venta/Salida registrada correctamente."})

    except Exception as e:
        current_app.logger.error(f"Error al registrar salida: {e}")
        return jsonify({"ok": False, "msg": str(e)}), 500
    finally:
        conexion.close()


@movimientos_bp.route("/historial")
def historial():
    conexion = get_db()
    query = """
        SELECT 'Entrada' AS tipo, e.fecha, p.nombre AS producto, e.cantidad, e.usuario, e.motivo
        FROM entradas e
        JOIN productos p ON e.producto_id = p.id
        UNION ALL
        SELECT 'Salida' AS tipo, s.fecha, p.nombre AS producto, s.cantidad, s.usuario, s.motivo
        FROM salidas s
        JOIN productos p ON s.producto_id = p.id
        ORDER BY fecha DESC
    """
    movimientos = conexion.execute(query).fetchall()
    conexion.close()
    return render_template("pages/historial/historial.html", movimientos=movimientos)
