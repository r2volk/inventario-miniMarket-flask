import bcrypt
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, current_app
from models.db import get_db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if session.get("autenticado"):
        return redirect(url_for("productos.index"))

    if request.method == "POST":
        usuario  = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        conn = get_db()
        user = conn.execute(
            "SELECT * FROM usuarios WHERE username = ?", (usuario,)
        ).fetchone()
        conn.close()

        if user and bcrypt.checkpw(
            password.encode("utf-8"), user["password_hash"].encode("utf-8")
        ):
            session["autenticado"] = True
            session["usuario"]     = usuario
            current_app.logger.info(f"Inicio de sesión exitoso: {usuario}")
            return redirect(url_for("productos.index"))
        else:
            if not user:
                current_app.logger.warning(f"Intento de login: usuario no encontrado ({usuario})")
                flash("Usuario no encontrado.", "error")
            else:
                current_app.logger.warning(f"Intento de login: contraseña incorrecta ({usuario})")
                flash("Contraseña incorrecta.", "error")

    return render_template("login/login.html")


@auth_bp.route("/logout")
def logout():
    usuario = session.get("usuario", "desconocido")
    session.clear()
    current_app.logger.info(f"Cierre de sesión: {usuario}")
    return redirect(url_for("auth.login"))
