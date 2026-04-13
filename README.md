# Global Yofi - Frontend

Este es el repositorio del frontend para **Global Yofi**, una plataforma de comercio electrónico y administración para una tienda de productos de belleza. Desarrollado con **Angular 20**, ofrece una experiencia de usuario moderna, reactiva y segura.

---

## 🚀 Tecnologías Principales

| Tecnología | Propósito |
|------------|-----------|
| **Angular 20** | Framework principal de la aplicación. |
| **RxJS** | Gestión de flujos de datos asíncronos. |
| **Chart.js** | Visualización de reportes y estadísticas en el panel admin. |
| **JWT** | Autenticación segura mediante interceptores. |
| **Tailwind / CSS** | Diseño responsivo y moderno. |
| **Dialogflow CX** | Integración de chatbot para asistencia al cliente. |

---

## ✨ Características Destacadas

### 🛒 Interfaz de Cliente
- **Catálogo de Productos**: Exploración con filtros avanzados por categoría y precio.
- **Carrito de Compras**: Gestión dinámica de artículos y persistencia local.
- **Proceso de Pago (Checkout)**: Flujo multi-paso para selección de método de pago y confirmación.
- **Historial de Pedidos**: Los clientes pueden seguir el estado de sus compras.

### 🤖 Asistencia Inteligente
- **Chatbot Integrado**: Soporte en tiempo real mediante Dialogflow CX para recomendaciones y consultas de stock.

### 🛡️ Panel Administrativo
- **Dashboard de Reportes**: Gráficos interactivos de inventario y ventas.
- **Gestión de Entidades**: CRUD completo de productos, categorías y proveedores.
- **Seguridad**: Rutas protegidas mediante Guards y manejo de roles.

---

## 🛠️ Instalación y Configuración

### 1. Requisitos Previos
- **Node.js**: Versión 18 o superior.
- **Angular CLI**: Instalado globalmente (`npm install -g @angular/cli`).

### 2. Pasos de Instalación
1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar el servidor de desarrollo:
   ```bash
   ng serve
   ```
   La aplicación estará disponible en `http://localhost:4200/`.

---

## ⚙️ Conexión con el Backend

Por defecto, la aplicación está configurada para comunicarse con el backend en:
`http://localhost:8080/api`

Para cambiar esta configuración, revisa los servicios en `src/app/services/`.

---

## 📂 Estructura del Proyecto

- `src/app/pages`: Vistas principales (Login, Tienda, Admin, Carrito).
- `src/app/components`: Componentes reutilizables (Navbar, Footer, Notificaciones).
- `src/app/services`: Lógica de comunicación con la API y estado global.
- `src/app/interceptors`: Manejo automático de tokens JWT en las peticiones.
- `src/app/routes.ts`: Definición de la navegación y protecciones de ruta.

---

## 👥 Autores
- **Edison Mauricio Beltrán**
- **Johann Toncon**
