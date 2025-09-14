# Backend Sistema de Pagos

## Estructura modular

- `server.js`: Punto de entrada principal
- `db.js`: Conexión a MySQL
- `routes/`: Rutas de la API (centros de costo, pagos, cuentas por pagar, configuración)
- `controllers/`: Lógica de negocio para cada recurso

## Uso

1. Crea un archivo `.env` en la carpeta `backend` con:

```
DB_HOST=tu_host
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_basededatos
PORT=4000
```

2. Instala dependencias:

```
npm install express cors body-parser mysql2 dotenv
```

3. Inicia el backend:

```
npm run start:backend
```

## Endpoints principales

- `/api/centros-costo` (CRUD)
- `/api/pagos` (CRUD)
- `/api/cuentas-por-pagar` (CRUD)
- `/api/configuracion` (GET, PUT)
