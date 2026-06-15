import sqlite3
from flask import Blueprint, request, jsonify, render_template, current_app
from models.db import get_db

proveedores_bp = Blueprint("proveedores", __name__)


@proveedores_bp.route("/proveedores")
def proveedores_page():
    conn = get_db()
    proveedores = conn.execute("SELECT * FROM proveedores ORDER BY nombre").fetchall()
    conn.close()
    return render_template(
        "pages/proveedores/proveedores.html", proveedores=proveedores
    )


@proveedores_bp.route("/api/proveedor/<int:id>")
def obtener_proveedor(id):
    conn = get_db()
    row = conn.execute("SELECT * FROM proveedores WHERE id = ?", (id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"ok": False, "msg": "Proveedor no encontrado."}), 404
    return jsonify(
        {
            "id": row["id"],
            "ruc": row["ruc"],
            "nombre": row["nombre"],
            "telefono": row["telefono"],
            "direccion": row["direccion"],
        }
    )


@proveedores_bp.route("/proveedor/<int:id>/editar", methods=["POST"])
def editar_proveedor(id):
    nombre = request.form.get("nombre", "").strip()
    telefono = request.form.get("telefono", "").strip()
    direccion = request.form.get("direccion", "").strip()

    if not nombre:
        return jsonify({"ok": False, "msg": "El nombre es obligatorio."}), 400

    conn = get_db()
    conn.execute(
        "UPDATE proveedores SET nombre=?, telefono=?, direccion=? WHERE id=?",
        (nombre, telefono, direccion, id),
    )
    conn.commit()
    conn.close()
    current_app.logger.info(f"Proveedor actualizado: ID {id} - {nombre}")
    return jsonify({"ok": True, "msg": "Proveedor actualizado."})


@proveedores_bp.route("/proveedor/<int:id>", methods=["DELETE"])
def eliminar_proveedor(id):
    conn = get_db()
    try:
        cursor = conn.execute("DELETE FROM proveedores WHERE id = ?", (id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"ok": False, "msg": "Proveedor no encontrado."}), 404
        current_app.logger.info(f"Proveedor eliminado: ID {id}")
        return jsonify({"ok": True, "msg": "Proveedor eliminado."})
    except sqlite3.IntegrityError:
        return (
            jsonify(
                {"ok": False, "msg": "No se puede eliminar: tiene entradas asociadas."}
            ),
            400,
        )
    finally:
        conn.close()


@proveedores_bp.route("/add_provider", methods=["POST"])
def add_provider():
    ruc = request.form.get("ruc", "").strip()
    nombre = request.form.get("nombre", "").strip()
    telefono = request.form.get("telefono", "").strip()
    direccion = request.form.get("direccion", "").strip()

    if not ruc or not nombre:
        return jsonify({"ok": False, "msg": "RUC y Nombre son obligatorios."}), 400

    conexion = get_db()
    try:
        conexion.execute(
            "INSERT INTO proveedores (ruc, nombre, telefono, direccion) VALUES (?, ?, ?, ?)",
            (ruc, nombre, telefono, direccion),
        )
        conexion.commit()
        current_app.logger.info(f"Proveedor creado: {nombre} (RUC: {ruc})")
        return jsonify({"ok": True, "msg": "Proveedor registrado."})

    except sqlite3.IntegrityError:
        current_app.logger.warning(
            f"Intento de crear proveedor con RUC duplicado: {ruc}"
        )
        return jsonify({"ok": False, "msg": "El RUC ya existe."}), 400

    finally:
        conexion.close()
