def test_login_get_returns_form(client):
    response = client.get("/login")
    assert response.status_code == 200
    assert b"Iniciar sesi\xc3\xb3n" in response.data


def test_login_valid_credentials(client):
    response = client.post(
        "/login",
        data={"username": "admin", "password": "12345"},
        follow_redirects=True,
    )
    assert response.status_code == 200
    assert b"Administrador" in response.data


def test_login_invalid_user(client):
    response = client.post(
        "/login",
        data={"username": "wrong", "password": "12345"},
        follow_redirects=True,
    )
    assert b"Usuario no encontrado" in response.data


def test_login_invalid_password(client):
    response = client.post(
        "/login",
        data={"username": "admin", "password": "wrong"},
        follow_redirects=True,
    )
    assert b"Contrase\xc3\xb1a incorrecta" in response.data


def test_logout(client):
    client.post("/login", data={"username": "admin", "password": "12345"})
    response = client.get("/logout", follow_redirects=True)
    assert response.status_code == 200
    assert b"Iniciar sesi\xc3\xb3n" in response.data


def test_protected_route_redirects_without_session(client):
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 302
    assert "/login" in response.location
