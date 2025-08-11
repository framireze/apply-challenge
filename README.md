---

# 🧭 Guía rápida de ejecución

A NestJS API that synchronizes product data from Contentful API every hour, provides public endpoints with pagination and filtering, and private administrative modules for reporting.

## 🚀 Features

- ✅ **Automatic synchronization** every hour with Contentful API
- ✅ **Public API** with pagination (maximum 5 items per page)
- ✅ **Advanced filters** by name, category, brand, price range
- ✅ **Soft delete** for products (won't reappear on app restart)
- ✅ **Private module** with administrative reports protected by JWT
- ✅ **PostgreSQL database** with TypeORM and migrations
- ✅ **Robust validation** of environment variables

## 📋 Prerequisites

- **Node.js** >= 22 (Active LTS)
- **NestJS** 11
- **Docker** and **Docker Compose**
- **npm** or **yarn**
- **PostgreSQL** 15+

## 📁 Estructura del proyecto

```bash
📦src
 ┣ 📂auth
 ┃ ┣ 📂decorators
 ┃ ┣ 📂interfaces
 ┃ ┣ 📜auth.controller.ts
 ┃ ┣ 📜auth.module.ts
 ┃ ┣ 📜auth.service.ts
 ┃ ┣ 📜jwt-auth.guard.ts
 ┃ ┗ 📜jwt.strategy.ts
 ┣ 📂config
 ┃ ┣ 📜data-source.ts
 ┃ ┗ 📜env.validation.ts
 ┣ 📂contentful
 ┃ ┣ 📂interfaces
 ┃ ┣ 📜contentful.controller.ts
 ┃ ┣ 📜contentful.module.ts
 ┃ ┗ 📜contentful.service.ts
 ┣ 📂migrations
 ┣ 📂products
 ┣ 📂reports
 ┣ 📜app.module.ts
 ┗ 📜main.ts
```

## 1) ⚙️ Configura las variables de entorno

Crea un archivo `.env` en la raíz con este contenido (puedes copiar/pegar):

```env
# APLICATION
NODE_ENV=development
PORT=3000
SECRET_KEY=mySecretKey

# CONTENT
CONTENTFUL_SPACE_ID=9xs1613l9f7v
CONTENTFUL_ACCESS_TOKEN=I-ThsT55eE_B3sCUWEQyDT4VqVO3x__20ufuie9usns
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product

# DB POSTGRESQL
DB_HOST=postgres         # ⚠️ En Docker SIEMPRE debe ser 'postgres'
DB_PORT=5432
DB_USERNAME=challenge
DB_PASSWORD=tu_password  # <- cámbialo si quieres, pero sincronízalo con docker-compose
DB_NAME=PRODUCTS
DB_SSL=false
DB_POOL_SIZE=10
```

> Nota: El proyecto valida el `.env` al iniciar. Si falta algo, mostrará un mensaje claro con la variable faltante.

## 2) 🐳 Levanta los servicios con Docker

Con Docker y Docker Compose instalados:

```bash
# construir y levantar todo en segundo plano
docker compose up -d --build

# (opcional) ver logs de la API
docker compose logs -f api
```

Esto levanta:

* **api** (NestJS)
* **postgres** (Base de datos)

> Las migraciones se ejecutan con el servicio de API. Si prefieres ejecutarlas manualmente:
>
> ```bash
> npm run migration:run
> ```

## 3) ✅ Valida las APIs en Swagger

Abre el navegador en: **[http://localhost:3000/api/docs#/](http://localhost:3000/api/docs#/)**

### Autenticación (para endpoints privados)

1. Llama a **GET `/auth/jwt`** para obtener un token de prueba.
2. En Swagger, presiona **Authorize** (arriba a la derecha) e ingresa:

   ```
   Bearer <tu-jwt>
   ```
3. Ya puedes consumir los endpoints protegidos (Reports).

---

# 📡 Endpoints principales

### Auth

* `GET /auth/jwt` → Autentica y entrega un **JWT** de prueba.

### Contentful

* `GET /contentful` → Dispara la **sincronización** de productos con Contentful (también corre automático cada hora).

### Products (público)

* `GET /product` → Lista productos con **paginación y filtros**
  Parámetros: `name`, `brand`, `model`, `category`, `minPrice`, `maxPrice`, `page`, `limit`
  Ejemplo: `/product?category=Smartphone&minPrice=500&page=1&limit=5`
* `DELETE /product/{sku}` → **Soft delete** por SKU (no se pierde el registro).

### Reports (privado, requiere JWT)

* `GET /reports/deleted-percentage` → Porcentaje de productos **eliminados**.
* `GET /reports/non-deleted-percentage` → Porcentaje de **no eliminados**
  Query opcionales:

  * `startDate`, `endDate` (rango)
  * `withPrice=true|false` (con/sin precio)
* `GET /reports/models` → Modelos **agrupados por marca** (opcional `brands=apple,lg`).

---

# 🧪 Tests y Linter (CI)

* **Tests**:

  ```bash
  npm test
  ```
* **Cobertura**:

  ```bash
  npm run test:cov
  ```
* **Lint**:

  ```bash
  npm run lint
  ```

  *(en GitHub Actions se ejecuta automáticamente al hacer push/PR a `develop`/`main`)*

---

# 🔐 Notas importantes

* **DB\_HOST** debe ser **`postgres`** cuando corres con Docker Compose (es el nombre del servicio en la red interna).
* Los endpoints privados usan **JWT**. Usa `GET /auth/jwt` para obtener un token rápido de demo y autorizar en Swagger.
* La sincronización con Contentful corre **cada hora** vía cron y también puedes dispararla manualmente con `GET /contentful`.

---

# 🔀 Flujo de trabajo (Conventional Commits + Gitflow)

* Trabaja en ramas `feature/*`, `fix/*`, `chore/*` desde `develop`.
* Commits con formato **Conventional Commits**:

  * `feat(reports): add non-deleted percentage endpoint`
  * `fix(products): handle decimal price type`
  * `test(contentful): cover sync error path`
* Abre PRs hacia `develop`.
* Crea `release/x.y.z` desde `develop`, luego merge a `main`.
* Urgencias en producción → `hotfix/*` desde `main`.

---