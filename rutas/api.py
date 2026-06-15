from flask import Blueprint, jsonify
from models.db import get_db

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/products")
def api_products():
    conexion = get_db()
    productos = conexion.execute(
        "SELECT id, codigo, nombre, stock FROM productos ORDER BY nombre"
    ).fetchall()
    conexion.close()
    return jsonify([dict(x) for x in productos])


@api_bp.route("/providers")
def api_providers():
    conexion = get_db()
    provedores = conexion.execute(
        "SELECT id, ruc, nombre FROM proveedores ORDER BY nombre"
    ).fetchall()
    conexion.close()
    return jsonify([dict(x) for x in provedores])
