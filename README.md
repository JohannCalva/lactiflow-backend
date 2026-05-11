# LactiFlow - Backend API

## Descripción del Proyecto
LactiFlow es una aplicación web diseñada para gestionar el inventario de una fábrica de lácteos y generar proyecciones de demanda basadas en el historial de entregas a clientes habituales (como panaderías, tiendas y cafeterías). 

Este repositorio corresponde exclusivamente al backend (Panel de Administración), el cual provee una API RESTful robusta y segura para gestionar toda la información de la fábrica, desde el catálogo de productos hasta el despacho de rutas de entrega, dividiendo los accesos de manera segura entre administradores y emprendedores/repartidores.

## Tecnologías Usadas
- **Runtime:** Node.js (con sintaxis ES Modules)
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL alojada en la nube mediante **Supabase**
- **Autenticación:** JSON Web Tokens (JWT)
- **Seguridad de contraseñas:** bcrypt
- **Manejo de variables:** dotenv

## Requisitos Previos
Antes de comenzar, asegúrate de tener instalado en tu máquina:
- **Node.js** (v18.x o superior recomendado). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
- Una cuenta activa en **Supabase** (y un proyecto creado con sus respectivas 5 tablas ya configuradas).
- Git para clonar el repositorio.

## Instalación y Configuración Local

**1. Clonar el repositorio**
Abre tu terminal y ejecuta:
```bash
git clone https://github.com/JohannCalva/lactiflow-backend.git
cd lactiflow-server
```

**2. Instalar dependencias**
Instala todas las librerías necesarias con npm:
```bash
npm install
```

**3. Variables de Entorno**
Crea un archivo llamado `.env` en la raíz del proyecto (a la misma altura que el `package.json`). El servidor necesita este archivo para conectarse a Supabase y firmar los tokens de sesión. 

El archivo `.env` debe lucir exactamente así:
```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase_aqui
SUPABASE_KEY=tu_anon_key_de_supabase_aqui
JWT_SECRET=tu_palabra_secreta_aqui
```

**¿De dónde obtengo estos valores?**
- `PORT`: Opcional, pero se recomienda usar 3000.
- `SUPABASE_URL` y `SUPABASE_KEY`: Los consigues en el dashboard de tu proyecto de Supabase, en la sección de **Project Settings > API**.
- `JWT_SECRET`: Una cadena de texto aleatoria creada por ti. Esta se utiliza para encriptar las sesiones (ej. `mi_palabra_hiper_secreta_lactiflow_2026`).

**4. Levantar el servidor**
Para correr el proyecto en modo de desarrollo (con autorecarga gracias a nodemon), ejecuta:
```bash
npm run dev
```
Si ves el mensaje `Servidor corriendo en puerto 3000` en tu consola, ¡todo está listo!

---

## Documentación para el Frontend

* **URL Base local:** `http://localhost:3000/api`
* **Formato de intercambio:** `application/json` (tanto para el `body` como para las respuestas).

---

## 1. Sistema de Autenticación (JWT)

La API **no utiliza cookies**. Toda la seguridad se maneja mediante un token JWT (JSON Web Token) que tiene un tiempo de expiración de 12 horas.

**Flujo de Autenticación para el Frontend:**
1. Enviar credenciales a `/auth/login` o registrar un usuario en `/auth/register`.
2. La API devuelve un objeto con un `token` en la respuesta.
3. Debes guardar este token (por ejemplo, en `localStorage` o `sessionStorage`).
4. Para realizar peticiones a cualquier otra ruta del backend, DEBES adjuntar este token en los **Headers** de la petición de la siguiente forma:
   ```json
   {
     "Authorization": "Bearer <TU_TOKEN>"
   }
   ```

---

## 2. Roles y Permisos

Existen dos roles en el sistema:
* **`admin` (Administrador):** Tiene acceso total a crear, leer, actualizar y borrar (CRUD completo) en todas las entidades del sistema (`business_type`, `client`, `product`, `user`, `delivery`).
* **`emprendedor` (Emprendedor):** Únicamente tiene acceso a la entidad `/delivery` para registrar o visualizar entregas. **Si un emprendedor intenta acceder a rutas como `/client` o `/product`, la API devolverá un error `403 Acceso Denegado`.**

---

## 3. Endpoints Disponibles

Todas las entidades comparten la misma estructura base de rutas (CRUD):
* `GET /api/{entidad}` -> Trae un arreglo `[]` con todos los registros.
* `GET /api/{entidad}/:id` -> Trae un objeto `{}` con el registro específico.
* `POST /api/{entidad}` -> Crea un registro (requiere enviar datos en el `body`).
* `PUT /api/{entidad}/:id` -> Actualiza un registro (requiere enviar datos en el `body`).
* `DELETE /api/{entidad}/:id` -> Elimina el registro por ID.

### Autenticación (`/auth`) - *Público, no requiere token*
* **POST `/auth/login`**: 
  - Recibe: `{ "email": "...", "password": "..." }`
  - Retorna: Los datos del usuario y el `token`.
* **POST `/auth/register`**: 
  - Recibe: `{ "name": "...", "email": "...", "password": "...", "role": "..." }` (el rol es opcional, por defecto es emprendedor).
  - Retorna: Los datos del usuario creado y el `token`.

### Tipos de Negocio (`/business_type`) - *Solo Admin*
Gestión de clasificaciones de clientes (Panadería, Tienda, etc.).
* **POST Body esperado:**
  ```json
  {
    "name": "Panadería",
    "description": "Local de venta de pan" 
  }
  ```

### Clientes (`/client`) - *Solo Admin*
Gestión del directorio de clientes.
* **POST Body esperado:**
  ```json
  {
    "name": "Panadería San José",
    "business_type_id": "uuid-del-tipo-de-negocio",
    "client_type": "A", 
    "address": "Calle Principal 123",
    "phone": "0991234567"
  }
  ```
  *(Nota: Al hacer GET, la respuesta incluirá automáticamente los datos anidados del `business_type` al que pertenece).*

### Productos (`/product`) - *Solo Admin*
Catálogo de la fábrica de lácteos.
* **POST Body esperado:**
  ```json
  {
    "name": "Leche Deslactosada",
    "unit": "litros", 
    "size": 1,
    "price": 1.25,
    "shelf_life_days": 15
  }
  ```

### Usuarios (`/user`) - *Solo Admin*
Gestión interna de empleados.
* **POST Body esperado:**
  ```json
  {
    "name": "Carlos",
    "email": "carlos@lactiflow.com",
    "password": "suClaveSegura",
    "role": "emprendedor"
  }
  ```
  *(Seguridad: Por defecto, el backend remueve la contraseña (password_hash) antes de devolver cualquier registro en las respuestas).*

### Entregas (`/delivery`) - *Admins y Emprendedores*
Registro de despachos/entregas.
* **POST Body esperado:**
  ```json
  {
    "client_id": "uuid-del-cliente",
    "product_id": "uuid-del-producto",
    "user_id": "uuid-del-usuario",
    "quantity": 10,
    "delivered_at": "2026-05-15",
    "notes": "Dejado en recepción"
  }
  ```
  *(Magia Backend: ¡El frontend NO necesita calcular ni enviar el campo `day_of_week`! El servidor deduce automáticamente si es "Lunes" o "Viernes" basándose en `delivered_at`. Además, un GET a las entregas traerá la información completa del cliente, producto y usuario atados a ese registro).*

---

## 4. Manejo de Errores Estandarizado

Para facilitar el parseo de errores en el Frontend (para mostrarlos en Toasts o Alertas), la API **siempre** devuelve un código HTTP descriptivo (`400`, `401`, `403`, `404`, `500`) y un JSON con esta estructura exacta cuando algo falla:

```json
{
  "error": "El mensaje de error amigable, ej: El email ya está registrado"
}
```
