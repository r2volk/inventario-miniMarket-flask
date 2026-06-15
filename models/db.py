import sqlite3
import logging
import config

logger = logging.getLogger(__name__)


def get_db():
    try:
        conexion = sqlite3.connect(config.DB_PATH)
        conexion.row_factory = sqlite3.Row
        return conexion
    except sqlite3.Error as e:
        logger.error(f"Error al conectar con la base de datos: {e}")
        raise RuntimeError(
            "No se pudo conectar con la base de datos. Verifica que el archivo exista y no esté corrupto."
        )
