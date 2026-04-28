from flask import Blueprint, render_template, request, redirect, url_for, session, flash

auth_bp = Blueprint("auth", __name__)

# ── Credenciales hardcodeadas (sin BD de usuarios) ──
USUARIO_VALIDO   = "admin"
PASSWORD_VALIDO  = "12345"


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    # Si ya hay sesión activa, redirige directo al dashboard
    if session.get("autenticado"):
        return redirect(url_for("productos.index"))

    if request.method == "POST":
        usuario  = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        if usuario == USUARIO_VALIDO and password == PASSWORD_VALIDO:
            session["autenticado"] = True
            session["usuario"]     = usuario
            return redirect(url_for("productos.index"))
        else:
            if usuario != USUARIO_VALIDO:
                flash("Usuario no encontrado.", "error")
            else:
                flash("Contraseña incorrecta.", "error")

    return render_template("login.html")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
