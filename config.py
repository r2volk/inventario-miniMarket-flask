import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.join(BASE_DIR, "inventario.db")

SECRET_KEY = os.getenv("SECRET_KEY", "cambio-en-produccion")
WTF_CSRF_ENABLED = True
