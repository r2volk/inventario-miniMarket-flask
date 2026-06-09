from flask import Blueprint, render_template

operaciones_bp = Blueprint("operaciones", __name__)


@operaciones_bp.route("/operaciones")
def operaciones():
    return render_template("pages/operaciones/operaciones.html")
