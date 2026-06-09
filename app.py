import os
from flask import Flask, session, redirect, url_for, send_from_directory
from jinja2 import FileSystemLoader, ChoiceLoader

from rutas.auth          import auth_bp
from rutas.productos     import productos_bp
from rutas.movimientos   import movimientos_bp
from rutas.proveedores   import proveedores_bp
from rutas.api           import api_bp
from rutas.dashboard_api import dashboard_api_bp
from rutas.operaciones   import operaciones_bp


def create_app():

    app = Flask(__name__)

    app.secret_key = "dj-minimarket-secret-2024"

    # --- EXTENDER BÚSQUEDA DE TEMPLATES ---
    # Permite {% include "pages/administrador/grafico/grafico.html" %} desde la raíz
    app.jinja_loader = ChoiceLoader([
        FileSystemLoader(app.root_path),
    ])

    # --- REGISTRO DE BLUEPRINTS ---
    app.register_blueprint(auth_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(movimientos_bp)
    app.register_blueprint(proveedores_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(dashboard_api_bp)
    app.register_blueprint(operaciones_bp)

    # --- SERVIDOR DE ASSETS POR PANTALLA ---
    # Sirve estáticos desde pages/, historial/, etc.
    @app.route("/scrn/<path:filename>")
    def scrn_assets(filename):
        return send_from_directory(app.root_path, filename)

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


# --- PUNTO DE ENTRADA ---
# Este bloque solo se ejecuta cuando corres: python app.py
# Si otro archivo importa este módulo (ej: para tests), NO se ejecuta
if __name__ == "__main__":
    app = create_app()

    app.run(
        debug=True,   # Recarga automáticamente al guardar cambios + muestra errores detallados
        port=5000     # La app estará disponible en http://localhost:5000
    )
