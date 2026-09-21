# FN-Pedidos - Aplicación Full Stack (Spring Boot + Angular + PostgreSQL)

Sistema de gestión de pedidos desarrollado con **Spring Boot (Java 17 / Gradle)** en el Backend, **Angular 21+** en el Frontend y **PostgreSQL** como base de datos.

---

## 🛠️ Prerrequisitos

| Modo de ejecución | Requisitos |
|---|---|
| **Docker Compose** *(recomendado)* | Docker Desktop (v24+) |
| **Manual / Desarrollo** | Java JDK 17, Node.js 22+, npm, Docker |

---

## 🐳 Ejecución con Docker Compose *(recomendado)*

Con un solo comando levanta los **3 servicios** del stack completo:
`PostgreSQL` → `Spring Boot Backend` → `Angular (Nginx)`.

```bash
# En la raíz del proyecto
docker compose up --build -d
```

La primera vez descarga las imágenes base y compila el código (~3-5 min).
Las siguientes ejecuciones reutilizan la caché y son mucho más rápidas.

### Verificar que todo está corriendo

```bash
docker compose ps
```

Deberías ver los 3 contenedores en estado `running` / `healthy`:

```
fn_pedidos_postgres   running (healthy)
fn_pedidos_backend    running
fn_pedidos_frontend   running
```

### URLs disponibles

| Servicio | URL |
|---|---|
| 🌐 **Frontend Angular** | http://localhost:4200 |
| ⚙️ **API REST Backend** | http://localhost:8080/api/pedidos |
| ❤️ **Health Check** | http://localhost:8080/api/health |
| 🗃️ **PostgreSQL** | localhost:5432 · db: `fn_pedidos_db` |

### Comandos útiles

```bash
# Ver logs en tiempo real de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Detener y eliminar los contenedores (conserva los datos de la BD)
docker compose down

# Detener y eliminar todo, incluidos los volúmenes (borra la BD)
docker compose down -v

# Reconstruir una imagen específica
docker compose build backend
docker compose build frontend
```

---

## 🔧 Ejecución Manual *(desarrollo local)*

Útil para desarrollar con hot-reload en el frontend o depurar el backend.

### 1. Iniciar la Base de Datos PostgreSQL

```bash
# Solo levanta el servicio de postgres
docker compose up postgres-db -d
```

### 2. Iniciar el Backend (Spring Boot)

```bash
cd backend

# Windows
gradlew.bat bootRun

# Linux / macOS
./gradlew bootRun
```

> Backend disponible en `http://localhost:8080`

### 3. Iniciar el Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

> Frontend disponible en `http://localhost:4200`

---

## 📁 Estructura del Proyecto

```
FN-pedidos/
├── docker-compose.yml          # Stack completo: PostgreSQL + Backend + Frontend
├── README.md                   # Guía de ejecución del proyecto
│
├── backend/                    # Proyecto Java Spring Boot (Gradle)
│   ├── Dockerfile              # Multi-stage: Gradle build → JRE 17 Alpine
│   ├── build.gradle            # Dependencias (Spring Data JPA, PostgreSQL, Lombok, Web)
│   └── src/main/java/com/pedidos/backend/
│       ├── domain/enums/       # EstadoPedido, TipoItem
│       ├── entity/             # PedidoEntity, ItemPedidoEntity (JPA + índices)
│       ├── dto/                # Request y Response DTOs
│       ├── repository/         # PedidoRepository (JPA + Stored Procedure)
│       ├── service/            # PedidoService (lógica de negocio y validaciones)
│       └── controller/         # PedidoController (/api/pedidos)
│
└── frontend/                   # Proyecto Angular (Standalone Components)
    ├── Dockerfile              # Multi-stage: Node 22 build → Nginx Alpine
    ├── nginx.conf              # SPA fallback + proxy reverso /api/ → backend
    └── src/app/
        ├── models/             # Interfaces TypeScript (Pedido, ItemPedido, etc.)
        ├── services/           # PedidoService (integración HTTP + fallback demo)
        ├── components/         # Componentes UI reutilizables
        ├── pages/              # Vistas principales (landing/dashboard)
        ├── guards/             # Guardias de navegación
        └── interceptors/       # Interceptores HTTP
```

---

## Diagrama de Arquitectura

![Diagrama de Arquitectura](Diagrama.png)
