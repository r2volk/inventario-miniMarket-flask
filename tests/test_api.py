def test_add_product(auth):
    response = auth.post(
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Arroz",
            "categoria": "Alimentos",
            "precio_compra": "5.50",
            "precio_venta": "8.00",
            "stock_min": "10",
        },
    )
    assert response.status_code == 200
    assert response.get_json()["ok"] is True


def test_add_product_missing_fields(auth):
    response = auth.post("/add_product", data={"codigo": "", "nombre": ""})
    assert response.status_code == 400
    assert response.get_json()["ok"] is False


def test_get_products_page(auth):
    auth.post(
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Arroz",
            "precio_compra": "5",
            "precio_venta": "8",
        },
    )
    response = auth.get("/productos")
    assert response.status_code == 200
    assert b"Arroz" in response.data


def test_delete_product(auth):
    auth.post(
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Arroz",
            "precio_compra": "5",
            "precio_venta": "8",
        },
    )
    response = auth.delete("/producto/P001")
    assert response.status_code == 200
    assert response.get_json()["ok"] is True


def test_delete_nonexistent_product(auth):
    response = auth.delete("/producto/NOEXISTE")
    assert response.status_code == 404
    assert response.get_json()["ok"] is False


def test_add_provider(auth):
    response = auth.post(
        "/add_provider",
        data={"ruc": "20123456789", "nombre": "Distribuidora ABC"},
    )
    assert response.status_code == 200
    assert response.get_json()["ok"] is True


def test_add_provider_missing_ruc(auth):
    response = auth.post("/add_provider", data={"nombre": "Test"})
    assert response.status_code == 400
    assert response.get_json()["ok"] is False


def test_api_products_endpoint(auth):
    auth.post(
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Arroz",
            "precio_compra": "5",
            "precio_venta": "8",
        },
    )
    response = auth.get("/api/products")
    assert response.status_code == 200
    data = response.get_json()
    assert any(p["codigo"] == "P001" for p in data)


def test_add_entry_stock_increases(auth):
    auth.post(
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Arroz",
            "precio_compra": "5",
            "precio_venta": "8",
        },
    )
    response = auth.post(
        "/add_entry",
        data={
            "producto_id": "1",
            "proveedor_id": "1",
            "cantidad": "50",
            "usuario": "admin",
            "motivo": "Compra inicial",
        },
    )
    assert response.status_code == 200
    assert response.get_json()["ok"] is True
