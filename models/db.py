import sqlite3

# Importamos DB_PATH desde config.py para no repetir la ruta en cada archivo
from config import DB_PATH

#abre una conexion a la base de datos SQlite, se llama al inicio de cada ruta que acceda a la bd
def get_db():

    # sqlite3.connect() abre el archivo .db (lo crea si no existe)
    conexion = sqlite3.connect(DB_PATH)

    #cambia el formato de los resultados, acceso por nombre de column (row['nombre'], row['stock'])
    conexion.row_factory = sqlite3.Row

    # devolvemos la conexión para que la ruta pueda ejecutar consultas
    return conexion
