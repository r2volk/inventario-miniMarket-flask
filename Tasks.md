# ✅ Checklist Maestro: Gestión Minimarket "Don José"

Este documento es una hoja de ruta completa para llevar el proyecto de un prototipo básico (50%) a un sistema profesional de gestión de minimarket.

---

## 🏗️ 1. Arquitectura y Base de Datos (Técnico)
- [x] Configuración inicial de Flask con Blueprints.
- [x] Conexión a Base de Datos SQLite.
- [x] Script de inicialización (`reset_db.py`).
- [ ] **Migraciones de Datos:** Implementar `Flask-Migrate` para no borrar la base de datos cada vez que cambies una tabla.
- [ ] **Variables de Entorno:** Usar un archivo `.env` para la `SECRET_KEY` (Seguridad).

## 🔐 2. Seguridad y Usuarios (Calidad)
- [x] Login y Logout básico.
- [x] Protección de rutas con `@app.before_request`.
- [ ] **Usuarios en BD:** Eliminar el usuario "admin" fijo en el código y crear una tabla `usuarios`.
- [ ] **Contraseñas Seguras:** Usar `hash` (PBKDF2 o BCrypt) para que nadie pueda ver las claves en la BD.
- [ ] **Roles de Acceso:**
    - **Administrador:** Acceso total (reportes, borrar productos).
    - **Vendedor:** Solo registrar ventas y ver stock.
    - **Almacenero:** Solo registrar entradas y proveedores.

## 🛒 3. Módulo de Ventas (Punto de Venta - POS)
*Actualmente el sistema solo permite sacar un producto a la vez, lo cual no es realista para un minimarket.*

- [ ] **Venta Multi-Producto (Carrito):** Poder agregar varios productos a una sola "Boleta" o "Venta".
- [ ] **Interfaz de Caja Rápida:** Una vista dedicada donde se pueda buscar por nombre o **Código de Barras**.
- [ ] **Cálculo de Totales:** Sumar subtotal, IGV/Impuestos y Total automáticamente.
- [ ] **Métodos de Pago:** Registrar si fue en Efectivo, Tarjeta o Transferencia (Yape/Plin).
- [ ] **Vuelto:** Calculadora automática de cuánto vuelto dar al cliente.
- [ ] **Generación de Ticket/Boleta:** Crear un PDF simple con el resumen de la compra.

## 📦 4. Gestión de Inventario Avanzada
- [x] Registro de productos y proveedores.
- [x] Entradas y Salidas simples.
- [ ] **Buscador por Código de Barras:** Integrar el uso de lectores de barras para agilizar todo.
- [ ] **Edición de Productos:** Poder corregir errores en el nombre o cambiar el precio sin borrar el producto.
- [ ] **Control de Lotes y Vencimientos:** 
    - [ ] Alerta visual si un producto vence en menos de 7 días.
    - [ ] Bloqueo de venta si el producto ya venció.
- [ ] **Gestión de Categorías:** Un panel para crear, editar o eliminar categorías (Abarrotes, Limpieza, etc.).
- [ ] **Ajuste de Stock Manual:** Función para corregir el stock en caso de rotura o error de conteo (Inventario físico).

## 👥 5. Clientes y Proveedores
- [x] Registro de proveedores básico.
- [ ] **Cartera de Clientes:** Tabla para registrar clientes frecuentes (DNI/RUC, Nombre).
- [ ] **Cuentas por Cobrar (Crédito):** Sistema para registrar "fiados" y controlar quién debe dinero.
- [ ] **Historial de Compras por Cliente:** Ver qué es lo que más compra cada persona.

## 📊 6. Reportes y Analítica (Lo que pide la gerencia)
*El Dashboard actual es visual, pero le falta lógica de negocio.*

- [ ] **Reporte de Ganancias:** Calcular: `(Precio Venta - Precio Compra) * Cantidad Vendida`.
- [ ] **Cierre de Caja Diario:** Reporte que sume todo lo vendido en el día por cada vendedor.
- [ ] **Productos "Top Ventas":** Lista de los 5 productos que más rotan.
- [ ] **Valorización del Almacén:** Saber cuánto dinero exacto hay invertido en mercadería hoy.
- [ ] **Exportación a Excel:** Botón para descargar el inventario actual para contabilidad.

## 🧪 7. Calidad y Pruebas (Académico)
*Indispensable para aprobar el curso con la mejor nota.*

- [ ] **Validaciones de Formulario:** Que no acepte letras en precios o cantidades negativas.
- [ ] **Pruebas Unitarias:** Crear una carpeta `tests/` y probar que el cálculo del stock sea siempre exacto.
- [ ] **Pruebas de Estrés:** Simular la carga de 500 productos a la vez para ver si el sistema se pone lento.
- [ ] **Manejo de Errores:** Si la base de datos falla, mostrar un mensaje amigable, no una pantalla de error técnica.

---
*Checklist v2.0 - Enfocado en funcionalidad de negocio y calidad de software.*
