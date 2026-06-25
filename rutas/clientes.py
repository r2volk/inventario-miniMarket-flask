import sqlite3
from flask import Blueprint, request, jsonify, render_template, current_app
from models.db import get_db

clientes_bp = Blueprint("clientes", __name__)


@clientes_bp.route("/clientes")
def clientes_page():
    conn = get_db()
    clientes = conn.execute("SELECT * FROM clientes ORDER BY nombre").fetchall()
    conn.close()
    return render_template(
        "pages/clientes/clientes.html", clientes=clientes
    )


@clientes_bp.route("/api/cliente/<int:id>")
def obtener_cliente(id):
    conn = get_db()
    row = conn.execute("SELECT * FROM clientes WHERE id = ?", (id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"ok": False, "msg": "Cliente no encontrado."}), 404
    return jsonify(
        {
            "id": row["id"],
            "dni_ruc": row["dni_ruc"],
            "nombre": row["nombre"],
            "telefono": row["telefono"],
            "direccion": row["direccion"],
        }
    )


@clientes_bp.route("/cliente/<int:id>/editar", methods=["POST"])
def editar_cliente(id):
    nombre = request.form.get("nombre", "").strip()
    telefono = request.form.get("telefono", "").strip()
    direccion = request.form.get("direccion", "").strip()

    if not nombre:
        return jsonify({"ok": False, "msg": "El nombre es obligatorio."}), 400

    conn = get_db()
    conn.execute(
        "UPDATE clientes SET nombre=?, telefono=?, direccion=? WHERE id=?",
        (nombre, telefono, direccion, id),
    )
    conn.commit()
    conn.close()
    current_app.logger.info(f"Cliente actualizado: ID {id} - {nombre}")
    return jsonify({"ok": True, "msg": "Cliente actualizado."})


@clientes_bp.route("/cliente/<int:id>", methods=["DELETE"])
def eliminar_cliente(id):
    conn = get_db()
    try:
        cursor = conn.execute("DELETE FROM clientes WHERE id = ?", (id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"ok": False, "msg": "Cliente no encontrado."}), 404
        current_app.logger.info(f"Cliente eliminado: ID {id}")
        return jsonify({"ok": True, "msg": "Cliente eliminado."})
    except sqlite3.IntegrityError:
        return (
            jsonify(
                {"ok": False, "msg": "No se puede eliminar: tiene registros asociados."}
            ),
            400,
        )
    finally:
        conn.close()


@clientes_bp.route("/add_cliente", methods=["POST"])
def add_cliente():
    dni_ruc = request.form.get("dni_ruc", "").strip()
    nombre = request.form.get("nombre", "").strip()
    telefono = request.form.get("telefono", "").strip()
    direccion = request.form.get("direccion", "").strip()

    if not dni_ruc or not nombre:
        return jsonify({"ok": False, "msg": "DNI/RUC y Nombre son obligatorios."}), 400

    conexion = get_db()
    try:
        conexion.execute(
            "INSERT INTO clientes (dni_ruc, nombre, telefono, direccion) VALUES (?, ?, ?, ?)",
            (dni_ruc, nombre, telefono, direccion),
        )
        conexion.commit()
        current_app.logger.info(f"Cliente creado: {nombre} (DNI/RUC: {dni_ruc})")
        return jsonify({"ok": True, "msg": "Cliente registrado."})

    except sqlite3.IntegrityError:
        current_app.logger.warning(
            f"Intento de crear cliente con DNI/RUC duplicado: {dni_ruc}"
        )
        return jsonify({"ok": False, "msg": "El DNI/RUC ya existe."}), 400

    finally:
        conexion.close()
