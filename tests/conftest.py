import os
import sys
import tempfile
import sqlite3

import bcrypt
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
import config

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT DEFAULT 'Administrador',
    rol TEXT DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT DEFAULT 'General',
    precio_compra REAL DEFAULT 0.0,
    precio_venta REAL DEFAULT 0.0,
    stock INTEGER DEFAULT 0,
    stock_min INTEGER DEFAULT 0,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruc TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT
);

CREATE TABLE IF NOT EXISTS entradas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    proveedor_id INTEGER,
    cantidad INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    vencimiento TEXT,
    usuario TEXT,
    motivo TEXT,
    FOREIGN KEY(producto_id) REFERENCES productos(id),
    FOREIGN KEY(proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS salidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    usuario TEXT,
    motivo TEXT,
    FOREIGN KEY(producto_id) REFERENCES productos(id)
);
"""


@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp(suffix=".db")

    conn = sqlite3.connect(db_path)
    conn.executescript(SCHEMA_SQL)

    pw_hash = bcrypt.hashpw(b"12345", bcrypt.gensalt()).decode("utf-8")
    conn.execute(
        "INSERT INTO usuarios (username, password_hash, nombre, rol) VALUES (?, ?, ?, ?)",
        ("admin", pw_hash, "Administrador", "admin"),
    )
    conn.execute(
        "INSERT INTO proveedores (ruc, nombre, telefono, direccion) VALUES (?, ?, ?, ?)",
        ("00000000000", "Proveedor General", "000-000", "Local"),
    )
    conn.commit()
    conn.close()

    original_path = config.DB_PATH
    config.DB_PATH = db_path

    app = create_app()
    app.config.update(
        {
            "TESTING": True,
            "WTF_CSRF_ENABLED": False,
        }
    )

    yield app

    config.DB_PATH = original_path
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth(client):
    client.post("/login", data={"username": "admin", "password": "12345"})
    return client
