def test_duplicate_product_code(auth):
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
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Arroz 2",
            "precio_compra": "6",
            "precio_venta": "9",
        },
    )
    assert response.status_code == 400
    assert "Código ya registrado" in response.get_json()["msg"]


def test_duplicate_provider_ruc(auth):
    auth.post("/add_provider", data={"ruc": "20123456789", "nombre": "ABC"})
    response = auth.post(
        "/add_provider", data={"ruc": "20123456789", "nombre": "XYZ"}
    )
    assert response.status_code == 400
    assert "RUC ya existe" in response.get_json()["msg"]


def test_negative_price(auth):
    response = auth.post(
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Test",
            "precio_compra": "-10",
            "precio_venta": "25",
        },
    )
    assert response.status_code == 400
    assert "negativo" in response.get_json()["msg"]


def test_insufficient_stock(auth):
    auth.post(
        "/add_product",
        data={
            "codigo": "P001",
            "nombre": "Arroz",
            "precio_compra": "5",
            "precio_venta": "8",
        },
    )
    response = auth.post("/add_output", data={"producto_id": "1", "cantidad": "5"})
    assert response.status_code == 400
    assert "insuficiente" in response.get_json()["msg"].lower()


def test_output_nonexistent_product(auth):
    response = auth.post("/add_output", data={"producto_id": "999", "cantidad": "1"})
    assert response.status_code == 404
    assert "Producto no encontrado" in response.get_json()["msg"]


def test_invalid_cantidad_entry(auth):
    response = auth.post(
        "/add_entry",
        data={
            "producto_id": "abc",
            "proveedor_id": "1",
            "cantidad": "10",
        },
    )
    assert response.status_code == 400
    assert "inv" in response.get_json()["msg"].lower()
