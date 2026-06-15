def test_dashboard_page(auth):
    response = auth.get("/")
    assert response.status_code == 200
    assert b"Administrador" in response.data


def test_dashboard_api(auth):
    response = auth.get("/api/dashboard")
    assert response.status_code == 200
    data = response.get_json()
    assert "total" in data
    assert "alertas" in data
    assert "vencimiento" in data
    assert "valor" in data
    assert "categoria" in data
    assert "productos" in data


def test_recent_activity_api(auth):
    response = auth.get("/api/recent-activity")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)


def test_history_page(auth):
    response = auth.get("/historial")
    assert response.status_code == 200
    assert b"Movimientos" in response.data


def test_404_page_shows_error_template(auth):
    response = auth.get("/ruta-inexistente")
    assert response.status_code == 404
    assert b"P\xc3\xa1gina no encontrada" in response.data
