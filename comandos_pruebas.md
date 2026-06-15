# Plan de Presentación — Pruebas y Métricas del Sistema

---

## Antes de empezar

Abrir terminal en la raíz del proyecto:

```bash
cd /Volumes/Ricardo/Documentos/inventario-miniMarket-flask
```

---

## 1. Ejecutar todas las pruebas unitarias (33 tests)

```bash
python3 -m pytest tests/ -v
```

**Qué hace:** Corre los 33 tests de una sola vez. Pytest descubre automáticamente todos los archivos `test_*.py` dentro de `tests/`.

**Qué muestra:**
- Cada test con su resultado (PASSED / FAILED)
- Tiempo total de ejecución

**Qué esperar:** 33 passed, 0 failed.

**Para el Word:** La salida completa muestra qué cubren los tests (auth, api, validaciones, dashboard, e2e, stress).

---

## 2. Prueba de estrés en vivo

```bash
python3 stress_test.py
```

**Qué hace:** Inserta 500 productos, 5 proveedores, 100 entradas y 50 salidas en la BD real, y mide tiempos de respuesta de 6 endpoints.

**Qué muestra:**
- Progreso de inserción de datos
- Tiempos de respuesta de cada endpoint
- Promedio final

**Qué esperar:** Todos los endpoints responden en < 2 segundos.

> **Aviso:** Este script modifica la BD real (`inventario.db`). Para restaurarla después, ejecutar `python3 reset_db.py`.

---

## 3. Cobertura de código

```bash
python3 -m pytest --cov=. tests/ --cov-report=term-missing
```

**Qué hace:** Mide qué porcentaje del código es ejecutado por los tests. `--cov-report=term-missing` muestra las líneas específicas que no están cubiertas.

**Qué muestra:**
```
Name                        Stmts   Miss  Cover   Missing
---------------------------------------------------------
app.py                         59      7    88%   56, 66-69, 86-87
rutas/auth.py                  31      1    97%   11
...
---------------------------------------------------------
TOTAL                         703    160    77%
```

**Qué esperar:** 77% de cobertura total.

---

## 4. Linter — Ruff

```bash
ruff check .
```

**Qué hace:** Analiza el código en busca de errores de sintaxis, malas prácticas, importaciones no usadas, estilo PEP8, etc.

**Qué muestra:**
```
E722 Do not use bare `except`
  --> rutas/dashboard_api.py:11:5
F401 [*] `flask.session` imported but unused
 --> tests/test_auth.py:1:19
```

**Qué esperar:** 2 errores (bare except y unused import). Son mínimos y fáciles de corregir.

---

## 5. Formato — Black (solo verificación)

```bash
black --check .
```

**Qué hace:** Verifica si el código sigue el formato estándar de Black (no modifica nada).

**Qué muestra:**
```
14 files would be reformatted, 6 files would be left unchanged.
```

**Qué esperar:** 20 files would be left unchanged — el código ya está formateado correctamente.

---

## 6. Complejidad Ciclomática — Radon

```bash
radon cc . -s
```

**Qué hace:** Mide la complejidad de cada función usando la métrica de McCabe. A (1-5) = simple, B (6-10) = moderada, C (11-20) = compleja, D/E = muy compleja.

**Qué muestra:**
```
stress_test.py
    F 33:0 main - C (14)
app.py
    F 20:0 create_app - A (1)
...
```

**Qué esperar:** La mayoría de funciones en A (bien), 2 funciones en C que podrían simplificarse.

---

## 7. Índice de Mantenibilidad — Radon

```bash
radon mi . -s
```

**Qué hace:** Calcula el Maintainability Index de cada archivo. A = 20-100 (alta mantenibilidad), B = 10-19 (media), C = 0-9 (baja).

**Qué muestra:**
```
config.py - A (100.00)
app.py - A (68.41)
...
```

**Qué esperar:** Todos los archivos en A. El código es altamente mantenible.

---

## 8. Líneas de Código (SLOC) — Radon

```bash
radon raw . -s
```

**Qué hace:** Cuenta líneas totales (LOC), líneas lógicas (LLOC), líneas de código fuente (SLOC), comentarios y líneas en blanco por archivo.

**Qué muestra:**
```
** Total **
    LOC: 1397
    LLOC: 781
    SLOC: 1136
    Comments: 22
```

**Qué esperar:** ~1136 líneas de código fuente, ~2% de comentarios.

---

## 9. Seguridad — Bandit

```bash
bandit -r . --skip=B101
```

**Qué hace:** Escanea el código en busca de vulnerabilidades de seguridad conocidas.

**Qué muestra:**
```
1 HIGH    → debug=True en app.py:88
1 MEDIUM  → SQL injection potencial en dashboard_api.py:35
6 LOW     → contraseña "12345" hardcodeada en tests
```

**Qué esperar:**
- **HIGH:** `debug=True` — aceptable para desarrollo, peligroso en producción.
- **MEDIUM:** SQL con f-string — debe corregirse usando parámetros.
- **LOW:** Contraseñas en tests — esperado, no es riesgo real.

---

## Resumen — Tabla de métricas (para el Word)

| # | Comando | Qué mide | Resultado esperado |
|---|---|---|---|
| 1 | `pytest tests/ -v` | Pruebas unitarias | 33 passed |
| 2 | `python3 stress_test.py` | Rendimiento bajo carga | < 2 seg/endpoint |
| 3 | `pytest --cov=. tests/` | Cobertura de código | 77% |
| 4 | `ruff check .` | Calidad de código (linter) | 0 errores |
| 5 | `black --check .` | Formato consistente | 20 files left unchanged (ok) |
| 6 | `radon cc . -s` | Complejidad ciclomática | Mayoría en A |
| 7 | `radon mi . -s` | Mantenibilidad | Todos en A |
| 8 | `radon raw . -s` | Líneas de código | ~1136 SLOC |
| 9 | `bandit -r .` | Seguridad | 1 HIGH, 1 MEDIUM |

---

## Respaldo de la BD (si se ejecuta stress_test.py)

Para restaurar la BD después de la prueba de estrés:

```bash
python3 reset_db.py
```

Esto regenera las tablas con el usuario por defecto (`admin` / `12345`).
