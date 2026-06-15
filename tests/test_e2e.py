def test_flujo_producto_entrada_dashboard(auth):
    r = auth.post(
        "/add_product",
        data={
            "codigo": "E2E001",
            "nombre": "Café E2E",
            "categoria": "Café",
            "precio_compra": "12.00",
            "precio_venta": "18.50",
            "stock_min": "5",
        },
    )
    assert r.status_code == 200
    assert r.get_json()["ok"] is True

    r = auth.post(
        "/add_entry",
        data={
            "producto_id": "1",
            "proveedor_id": "1",
            "cantidad": "50",
            "usuario": "admin",
            "motivo": "Compra E2E",
        },
    )
    assert r.status_code == 200
    assert r.get_json()["ok"] is True

    r = auth.get("/api/products")
    assert r.status_code == 200
    productos = r.get_json()
    assert any(p["codigo"] == "E2E001" and p["stock"] == 50 for p in productos)

    r = auth.get("/api/dashboard")
    assert r.status_code == 200
    data = r.get_json()
    assert data["total"] >= 1


def test_flujo_proveedor_entrada_historial(auth):
    r = auth.post(
        "/add_provider",
        data={
            "ruc": "E2E123456789",
            "nombre": "Proveedor E2E",
            "telefono": "999-888-777",
        },
    )
    assert r.status_code == 200
    assert r.get_json()["ok"] is True

    r = auth.post(
        "/add_product",
        data={
            "codigo": "E2E002",
            "nombre": "Arroz E2E",
            "precio_compra": "3.50",
            "precio_venta": "5.00",
        },
    )
    assert r.status_code == 200

    r = auth.post(
        "/add_entry",
        data={
            "producto_id": "1",
            "proveedor_id": "2",
            "cantidad": "100",
            "usuario": "admin",
            "motivo": "Compra a Proveedor E2E",
        },
    )
    assert r.status_code == 200
    assert r.get_json()["ok"] is True

    r = auth.get("/historial")
    assert r.status_code == 200
    html = r.data.decode("utf-8")
    assert "Arroz E2E" in html
    assert "Entrada" in html


def test_flujo_salida_stock_movimiento(auth):
    r = auth.post(
        "/add_product",
        data={
            "codigo": "E2E003",
            "nombre": "Leche E2E",
            "precio_compra": "2.00",
            "precio_venta": "3.50",
        },
    )
    assert r.status_code == 200

    r = auth.post(
        "/add_entry",
        data={
            "producto_id": "1",
            "proveedor_id": "1",
            "cantidad": "100",
            "usuario": "admin",
            "motivo": "Stock inicial",
        },
    )
    assert r.status_code == 200

    r = auth.post(
        "/add_output",
        data={
            "producto_id": "1",
            "cantidad": "30",
            "usuario": "admin",
            "motivo": "Venta al público",
        },
    )
    assert r.status_code == 200
    assert r.get_json()["ok"] is True

    r = auth.get("/api/products")
    assert r.status_code == 200
    productos = r.get_json()
    leche = next(p for p in productos if p["codigo"] == "E2E003")
    assert leche["stock"] == 70

    r = auth.get("/historial")
    assert r.status_code == 200
    html = r.data.decode("utf-8")
    assert "Leche E2E" in html
    assert "Salida" in html
