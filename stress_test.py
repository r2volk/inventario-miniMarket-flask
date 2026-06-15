import os
import sys
import time
import sqlite3
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config
from app import create_app

CANTIDAD_PRODUCTOS = 500
CANTIDAD_PROVEEDORES = 5
CANTIDAD_ENTRADAS = 100
CANTIDAD_SALIDAS = 50
LIMITE_SEGUNDOS = 2.0


def generar_productos(cantidad):
    categorias = [
        "Alimentos",
        "Bebidas",
        "Limpieza",
        "Cuidado Personal",
        "Carnes",
        "Lácteos",
        "Panadería",
        "Enlatados",
        "Granos",
        "Condimentos",
    ]
    productos = []
    for i in range(1, cantidad + 1):
        nombre = f"Producto de prueba {i:03d}"
        codigo = f"STR{i:03d}"
        cat = categorias[i % len(categorias)]
        pc = round(1 + (i % 200) * 0.25, 2)
        pv = round(pc * 1.3, 2)
        productos.append((codigo, nombre, cat, pc, pv, i % 50 + 5, 10, ""))
    return productos


def main():
    bd = config.DB_PATH
    print(f"Archivo BD: {bd}\n")

    if input("¿Insertar datos de prueba? (s/N): ").strip().lower() != "s":
        print("Cancelado.")
        return

    conn = sqlite3.connect(bd)
    ahora = datetime.datetime.now().isoformat(timespec="seconds")

    # ── 1. Proveedores ──
    proveedores = [
        (f"9999900000{i}", f"Proveedor STR {i}", f"900-000-00{i}", f"Av. Prueba {i}")
        for i in range(1, CANTIDAD_PROVEEDORES + 1)
    ]
    conn.executemany(
        "INSERT OR IGNORE INTO proveedores (ruc, nombre, telefono, direccion) VALUES (?, ?, ?, ?)",
        proveedores,
    )
    conn.commit()
    print(f"✓ {CANTIDAD_PROVEEDORES} proveedores insertados")

    # ── 2. Productos ──
    productos = generar_productos(CANTIDAD_PRODUCTOS)
    t0 = time.time()
    conn.executemany(
        "INSERT INTO productos (codigo, nombre, categoria, precio_compra, precio_venta, stock, stock_min, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        productos,
    )
    conn.commit()
    t_insert = time.time() - t0
    print(f"✓ {CANTIDAD_PRODUCTOS} productos insertados en {t_insert:.3f}s")

    # Obtener IDs de productos y proveedores insertados
    prod_ids = [
        r[0]
        for r in conn.execute(
            "SELECT id FROM productos WHERE codigo LIKE 'STR%' ORDER BY id"
        ).fetchall()
    ]
    prov_ids = [
        r[0]
        for r in conn.execute(
            "SELECT id FROM proveedores WHERE ruc LIKE '99999%' ORDER BY id"
        ).fetchall()
    ]

    # ── 3. Entradas ──
    hoy = datetime.date.today()
    entradas = []
    for idx in range(CANTIDAD_ENTRADAS):
        pid = prod_ids[idx]
        pvid = prov_ids[idx % len(prov_ids)]
        cant = (idx + 1) * 10
        # Algunas fechas de vencimiento próximas (para que aparezca "por vencer")
        if idx % 4 == 0:
            ven = (hoy + datetime.timedelta(days=5 + idx)).isoformat()
        else:
            ven = "2099-12-31"
        entradas.append((pid, pvid, cant, ahora, ven, "admin", "Compra inicial"))
    conn.executemany(
        "INSERT INTO entradas (producto_id, proveedor_id, cantidad, fecha, vencimiento, usuario, motivo) VALUES (?, ?, ?, ?, ?, ?, ?)",
        entradas,
    )
    conn.commit()
    print(f"✓ {CANTIDAD_ENTRADAS} entradas de stock registradas")

    # ── 4. Salidas ──
    salidas = []
    for idx in range(CANTIDAD_SALIDAS):
        pid = prod_ids[idx]
        cant = (idx + 1) * 2
        salidas.append((pid, cant, ahora, "admin", "Venta al público"))
    conn.executemany(
        "INSERT INTO salidas (producto_id, cantidad, fecha, usuario, motivo) VALUES (?, ?, ?, ?, ?)",
        salidas,
    )
    conn.commit()
    print(f"✓ {CANTIDAD_SALIDAS} salidas de stock registradas")
    conn.close()

    # ── Mediciones con Flask ──
    app = create_app()
    app.config["TESTING"] = True
    app.config["WTF_CSRF_ENABLED"] = False
    client = app.test_client()

    login = client.post("/login", data={"username": "admin", "password": "12345"})
    if login.status_code not in (200, 302):
        print("\nERROR: No se pudo iniciar sesión. ¿Ejecutaste 'python3 reset_db.py'?")
        return

    pruebas = [
        ("GET /productos", lambda: client.get("/productos")),
        ("GET /api/dashboard", lambda: client.get("/api/dashboard")),
        ("GET /api/products", lambda: client.get("/api/products")),
        ("GET /api/providers", lambda: client.get("/api/providers")),
        ("GET /historial", lambda: client.get("/historial")),
        ("GET /api/recent-activity", lambda: client.get("/api/recent-activity")),
    ]

    todos_ok = True
    print(f"\n{'':6s} | {'Endpoint':30s} | {'Tiempo':8s} | HTTP")
    print("-" * 55)

    for nombre, peticion in pruebas:
        t0 = time.time()
        respuesta = peticion()
        elapsed = time.time() - t0
        ok = elapsed < LIMITE_SEGUNDOS
        estado = "OK" if ok else "⚠️ LENTO"
        print(f"{estado:6s} | {nombre:30s} | {elapsed:.3f}s | {respuesta.status_code}")
        if not ok:
            todos_ok = False

    if todos_ok:
        print(
            f"\nTodos los endpoints respondieron en menos de {LIMITE_SEGUNDOS}s → PRUEBA SUPERADA ✅"
        )
    else:
        print(
            f"\nAlgunos endpoints superaron el límite de {LIMITE_SEGUNDOS}s → REVISAR ⚠️"
        )

    # ── Limpieza ──
    if input("\n¿Eliminar todos los datos de prueba? (s/N): ").strip().lower() == "s":
        conn = sqlite3.connect(bd)
        conn.execute(
            "DELETE FROM salidas WHERE producto_id IN (SELECT id FROM productos WHERE codigo LIKE 'STR%')"
        )
        conn.execute(
            "DELETE FROM entradas WHERE producto_id IN (SELECT id FROM productos WHERE codigo LIKE 'STR%')"
        )
        conn.execute("DELETE FROM proveedores WHERE ruc LIKE '99999%'")
        eliminados = conn.execute(
            "DELETE FROM productos WHERE codigo LIKE 'STR%'"
        ).rowcount
        conn.commit()
        conn.close()
        print(f"Datos de prueba eliminados ({eliminados} productos).")


if __name__ == "__main__":
    main()
