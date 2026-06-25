import os
import logging
from flask import (
    Flask,
    session,
    redirect,
    url_for,
    send_from_directory,
    render_template,
    request,
    jsonify,
)
from flask_wtf.csrf import CSRFProtect
from jinja2 import FileSystemLoader, ChoiceLoader

from rutas.auth import auth_bp
from rutas.productos import productos_bp
from rutas.movimientos import movimientos_bp
from rutas.proveedores import proveedores_bp
from rutas.api import api_bp
from rutas.clientes import clientes_bp
from rutas.dashboard_api import dashboard_api_bp
from rutas.operaciones import operaciones_bp

import config

csrf = CSRFProtect()


def create_app():

    app = Flask(__name__)

    app.secret_key = config.SECRET_KEY

    # --- LOGGING A ARCHIVO ---
    log_path = os.path.join(config.BASE_DIR, "app.log")
    handler = logging.FileHandler(log_path)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info("Aplicación iniciada")

    # --- CSRF PROTECTION ---
    csrf.init_app(app)

    # --- EXTENDER BÚSQUEDA DE TEMPLATES ---
    app.jinja_loader = ChoiceLoader(
        [
            FileSystemLoader(app.root_path),
        ]
    )

    # --- REGISTRO DE BLUEPRINTS ---
    app.register_blueprint(auth_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(movimientos_bp)
    app.register_blueprint(proveedores_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(dashboard_api_bp)
    app.register_blueprint(operaciones_bp)

    # --- SERVIDOR DE ASSETS POR PANTALLA ---
    @app.route("/scrn/<path:filename>")
    def scrn_assets(filename):
        return send_from_directory(app.root_path, filename)

    # --- ERROR 404 — PÁGINA NO ENCONTRADA ---
    @app.errorhandler(404)
    def not_found(e):
        return render_template("errors/404.html"), 404

    # --- ERROR 500 — ERROR INTERNO ---
    @app.errorhandler(500)
    def server_error(e):
        app.logger.error(f"Error 500: {e}")
        if request.is_json or request.path.startswith("/api"):
            return jsonify({"ok": False, "msg": "Error interno del servidor."}), 500
        return render_template("errors/500.html"), 500

    # --- PROTECCIÓN DE RUTAS ---
    @app.before_request
    def require_login():
        from flask import request

        rutas_publicas = {"auth.login", "static", "scrn_assets"}
        if request.blueprint in ("api", "dashboard_api"):
            return
        if not session.get("autenticado"):
            if request.endpoint not in rutas_publicas:
                return redirect(url_for("auth.login"))

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        debug=True,
        port=5000,
    )
