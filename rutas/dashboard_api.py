import datetime
from flask import Blueprint, jsonify
from models.db import get_db

def _formatear_fecha(iso):
    """Convierte ISO 8601 a algo legible, ej: '12 ene, 15:30'"""
    try:
        dt = datetime.datetime.fromisoformat(iso)
        meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
        return f"{dt.day} {meses[dt.month-1]}, {dt.hour:02d}:{dt.minute:02d}"
    except:
        return iso

dashboard_api_bp = Blueprint("dashboard_api", __name__, url_prefix="/api")


@dashboard_api_bp.route("/dashboard")
def api_dashboard():
    conn = get_db()

    total_productos = conn.execute("SELECT COUNT(*) FROM productos").fetchone()[0]
    alertas_stock = conn.execute(
        "SELECT COUNT(*) FROM productos WHERE stock <= stock_min"
    ).fetchone()[0]

    valor_total = conn.execute(
        "SELECT SUM(stock * precio_compra) FROM productos"
    ).fetchone()[0]
    if valor_total is None:
        valor_total = 0

    hoy = datetime.date.today().isoformat()
    limite = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
    por_vencer = conn.execute(
        f"SELECT COUNT(*) FROM entradas WHERE vencimiento <= '{limite}' AND vencimiento >= '{hoy}'"
    ).fetchone()[0]

    query_grafico_categoria = conn.execute(
        "SELECT categoria, COUNT(*) AS cantidad FROM productos GROUP BY categoria"
    ).fetchall()
    query_grafico_productos = conn.execute(
        "SELECT nombre, stock FROM productos ORDER BY precio_venta DESC LIMIT 100;"
    ).fetchall()

    conn.close()

    return jsonify({
        "total":        total_productos,
        "alertas":      alertas_stock,
        "vencimiento":  por_vencer,
        "valor":        valor_total,
        "categoria": {
            "labels": [row['categoria'] for row in query_grafico_categoria],
            "values": [row['cantidad'] for row in query_grafico_categoria]
        },
        "productos": {
            "labels": [row['nombre'] for row in query_grafico_productos],
            "values": [row['stock'] for row in query_grafico_productos]
        }
    })


@dashboard_api_bp.route("/recent-activity")
def api_recent_activity():
    conn = get_db()
    rows = conn.execute("""
        SELECT 'Entrada' AS tipo, e.fecha, p.nombre AS producto, e.cantidad, e.usuario, e.motivo
        FROM entradas e JOIN productos p ON e.producto_id = p.id
        UNION ALL
        SELECT 'Salida' AS tipo, s.fecha, p.nombre AS producto, s.cantidad, s.usuario, s.motivo
        FROM salidas s JOIN productos p ON s.producto_id = p.id
        ORDER BY fecha DESC
        LIMIT 12
    """).fetchall()
    conn.close()

    return jsonify([{
        "tipo":     r["tipo"],
        "producto": r["producto"],
        "cantidad": r["cantidad"],
        "fecha":    _formatear_fecha(r["fecha"]),
        "usuario":  r["usuario"] or "—",
        "motivo":   r["motivo"] or "—",
    } for r in rows])
