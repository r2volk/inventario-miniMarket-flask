import sqlite3
import bcrypt

connection = sqlite3.connect("inventario.db")
cursor = connection.cursor()

# 1. Limpieza total
cursor.execute("DROP TABLE IF EXISTS entradas")
cursor.execute("DROP TABLE IF EXISTS salidas")
cursor.execute("DROP TABLE IF EXISTS productos")
cursor.execute("DROP TABLE IF EXISTS proveedores")
cursor.execute("DROP TABLE IF EXISTS usuarios")
cursor.execute("DROP TABLE IF EXISTS categorias")

# 2. Tabla de usuarios (NUEVA)
cursor.execute("""
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT DEFAULT 'Administrador',
    rol TEXT DEFAULT 'admin'
)
""")

# Insertar usuario admin por defecto con contraseña hasheada
pw_hash = bcrypt.hashpw(b"12345", bcrypt.gensalt()).decode("utf-8")
cursor.execute(
    "INSERT INTO usuarios (username, password_hash, nombre, rol) VALUES (?, ?, ?, ?)",
    ("admin", pw_hash, "Administrador", "admin"),
)

# 3. Tabla de categorías
cursor.execute("""
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
)
""")

# Poblar con categorías por defecto
categorias = [
    "Frutas y Verduras",
    "Carnes",
    "Panadería",
    "Congelados",
    "Enlatados",
    "Granos y Cereales",
    "Pastas",
    "Aceites",
    "Condimentos",
    "Botanas",
    "Café",
    "Té",
    "Jugos",
    "Agua",
    "Bebidas Energéticas",
    "Cuidado Personal",
    "Higiene Personal",
    "Productos para Bebé",
    "Mascotas",
    "Papel y Desechables",
    "Utensilios de Cocina",
    "Papelería",
    "Ferretería",
    "Ropa",
    "Comida Preparada",
]
for cat in categorias:
    cursor.execute("INSERT OR IGNORE INTO categorias (nombre) VALUES (?)", (cat,))

# 4. Tablas base
cursor.execute("""
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT,
    precio_compra REAL DEFAULT 0.0,
    precio_venta REAL DEFAULT 0.0,
    stock INTEGER DEFAULT 0,
    stock_min INTEGER DEFAULT 0,
    descripcion TEXT
)
""")

cursor.execute("""
CREATE TABLE proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruc TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT
)
""")

# 5. Tabla ENTRADAS
cursor.execute("""
CREATE TABLE entradas (
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
)
""")

cursor.execute("""
CREATE TABLE salidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    usuario TEXT,
    motivo TEXT,
    FOREIGN KEY(producto_id) REFERENCES productos(id)
)
""")

# 6. Datos de prueba mínimos
cursor.execute(
    "INSERT INTO proveedores (ruc, nombre, telefono, direccion) VALUES (?, ?, ?, ?)",
    ("00000000000", "Proveedor General", "000-000", "Local"),
)

connection.commit()
connection.close()
print("LISTO: Base de datos actualizada con tabla de usuarios y contraseñas hasheadas.")
