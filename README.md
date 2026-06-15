# Sistema de Gestión de Inventario para Minimarket

**Python / Flask / SQLite / CSS Modular / JavaScript ES6**

Aplicación web responsiva para control de inventario, proveedores, entradas/salidas de stock y dashboard analítico con gráficos.

---

## Capturas

| Login | Dashboard | Productos | Kardex |
|-------|-----------|-----------|--------|
| ![Login](imgs/Login.png) | ![Dashboard](imgs/DashboardPrincipal.png) | ![Productos](imgs/TablaProductos.png) | ![Historial](imgs/HistorialCambios.png) |

---

## Características

- **Autenticación** con bcrypt + sesión cifrada (contraseñas en DB)
- **Dashboard** con tarjetas KPI, gráfico Chart.js (categorías / stock), alertas de stock mínimo y vencimientos
- **CRUD de productos** con categorías, edición en línea, eliminación con confirmación
- **CRUD de proveedores** con edición y eliminación (protección por FK)
- **Entradas y salidas** de stock con validación de existencias y control de lotes/fechas
- **Historial unificado** (Kardex) con buscador en tiempo real
- **Modo oscuro** con persistencia en localStorage
- **CSRF** automático en todos los formularios POST via Flask-WTF
- **33 tests** (unitarios, integración, estrés y E2E), cobertura ~77 %
- **Código verificado** con ruff, black, radon, bandit

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3, Flask, Flask-WTF |
| Base de datos | SQLite3 |
| Frontend | HTML (Jinja2), CSS modular, JavaScript ES6 |
| Gráficos | Chart.js (CDN) |
| Seguridad | bcrypt, python-dotenv, sesiones cifradas |
| Tests | pytest, pytest-cov |

---

## Instalación y ejecución

```bash
# 1. Clonar
git clone https://github.com/rlaur205/gestion-inventario-flask.git
cd gestion-inventario-flask

# 2. Crear entorno virtual (opcional pero recomendado)
python3 -m venv venv
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt
# Si no usas requirements.txt: pip install flask flask-wtf pytest pytest-cov python-dotenv bcrypt

# 4. Configurar variable de entorno SECRET_KEY
echo "SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')" > .env

# 5. Inicializar base de datos
python3 reset_db.py

# 6. Ejecutar
python3 app.py
```

Abrir `http://localhost:5000` y acceder con:

| Usuario | Contraseña |
|---------|-----------|
| admin | 12345 |

---

## Tests

```bash
pytest                          # 33 tests
pytest --cov=. --cov-report=term  # cobertura
pytest tests/test_stress.py     # test de estrés (500 productos)
pytest tests/test_e2e.py -v     # tests end-to-end
```

---

## Calidad de código

```bash
ruff check .                    # linting
black --check .                 # formato
radon cc . -s                   # complejidad ciclomática
radon mi . -s                   # maintainability index
bandit -r .                     # seguridad
```

---

## Licencia

MIT
