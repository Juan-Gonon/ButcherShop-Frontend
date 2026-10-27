# ButcherShop Frontend

Aplicación web interactiva y cliente en tiempo real para el sistema de gestión de pedidos en carnicerías. Construida con **React.js**, **Redux Toolkit** y **TypeScript**.

---

## 🚀 Tecnologías Principales

- **React.js** & **TypeScript** (Desarrollo frontend fuertemente tipado)
- **Redux Toolkit** (Gestión de estado global y asíncrono)
- **pnpm** (Gestor de paquetes ultrarrápido)
- **Vite** (Build tool y servidor de desarrollo)
- **WebSockets** (Sincronización y recepción de pedidos en tiempo real)
- **React Router DOM** (Navegación y protección de rutas)
- **Tailwind CSS** (Estilos interactivos y diseño adaptativo)

---

## 🏗️ Arquitectura del Estado Global (Redux)

La aplicación utiliza **Redux Toolkit** para centralizar la gestión de datos e integrarse directamente con la API REST y la conexión de WebSockets:

```text
[Redux Store] ──┬──> [authSlice]        (Sesión, credenciales y autenticación JWT)
                ├──> [ordersSlice]      (Estado y actualización de pedidos en tiempo real)
                ├──> [productsSlice]    (Catálogo y precios de productos)
                └──> [cartSlice / POS]  (Consolidación de órdenes y carrito de compras)

    