import time
import sqlite3
import datetime
import config

LIMITE_SEGUNDOS = 2.0
CANTIDAD_PRODUCTOS = 500
CANTIDAD_PROVEEDORES = 5
CANTIDAD_ENTRADAS = 100
CANTIDAD_SALIDAS = 50


def _insertar_datos_masivos():
    conn = sqlite3.connect(config.DB_PATH)
    ahora = datetime.datetime.now().isoformat(timespec="seconds")
    hoy = datetime.date.today()

    proveedores = [
        (f"9999900000{i}", f"Proveedor STR {i}", f"900-000-00{i}", f"Av. Prueba {i}")
        for i in range(1, CANTIDAD_PROVEEDORES + 1)
    ]
    conn.executemany(
        "INSERT OR IGNORE INTO proveedores (ruc, nombre, telefono, direccion) VALUES (?, ?, ?, ?)",
        proveedores,
    )

    categorias = ["Alimentos", "Bebidas", "Limpieza", "Cuidado Personal", "Carnes"]
    productos = []
    for i in range(1, CANTIDAD_PRODUCTOS + 1):
        pc = round(1 + (i % 200) * 0.25, 2)
        productos.append(
            (
                f"STR{i:03d}",
                f"Producto de prueba {i:03d}",
                categorias[i % len(categorias)],
                pc,
                round(pc * 1.3, 2),
                i % 50 + 5,
                10,
                "",
            )
        )
    conn.executemany(
        "INSERT INTO productos (codigo, nombre, categoria, precio_compra, precio_venta, stock, stock_min, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        productos,
    )

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

    entradas = []
    for idx in range(CANTIDAD_ENTRADAS):
        ven = (
            (hoy + datetime.timedelta(days=5 + idx)).isoformat()
            if idx % 4 == 0
            else "2099-12-31"
        )
        entradas.append(
            (
                prod_ids[idx],
                prov_ids[idx % len(prov_ids)],
                (idx + 1) * 10,
                ahora,
                ven,
                "admin",
                "Compra inicial",
            )
        )
    conn.executemany(
        "INSERT INTO entradas (producto_id, proveedor_id, cantidad, fecha, vencimiento, usuario, motivo) VALUES (?, ?, ?, ?, ?, ?, ?)",
        entradas,
    )

    salidas = [
        (prod_ids[idx], (idx + 1) * 2, ahora, "admin", "Venta al público")
        for idx in range(CANTIDAD_SALIDAS)
    ]
    conn.executemany(
        "INSERT INTO salidas (producto_id, cantidad, fecha, usuario, motivo) VALUES (?, ?, ?, ?, ?)",
        salidas,
    )

    conn.commit()
    conn.close()


def test_stress_productos_page(auth):
    _insertar_datos_masivos()
    t0 = time.time()
    r = auth.get("/productos")
    elapsed = time.time() - t0
    assert r.status_code == 200
    assert elapsed < LIMITE_SEGUNDOS, f"GET /productos tardó {elapsed:.3f}s"


def test_stress_dashboard_api(auth):
    _insertar_datos_masivos()
    t0 = time.time()
    r = auth.get("/api/dashboard")
    elapsed = time.time() - t0
    assert r.status_code == 200
    assert elapsed < LIMITE_SEGUNDOS, f"GET /api/dashboard tardó {elapsed:.3f}s"


def test_stress_products_api(auth):
    _insertar_datos_masivos()
    t0 = time.time()
    r = auth.get("/api/products")
    elapsed = time.time() - t0
    assert r.status_code == 200
    assert len(r.get_json()) == CANTIDAD_PRODUCTOS
    assert elapsed < LIMITE_SEGUNDOS, f"GET /api/products tardó {elapsed:.3f}s"


def test_stress_history_page(auth):
    _insertar_datos_masivos()
    t0 = time.time()
    r = auth.get("/historial")
    elapsed = time.time() - t0
    assert r.status_code == 200
    assert elapsed < LIMITE_SEGUNDOS, f"GET /historial tardó {elapsed:.3f}s"
