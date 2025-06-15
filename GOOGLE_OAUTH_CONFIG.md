# Configuración de Google OAuth para UT Assets

## Variables de entorno requeridas

Agrega las siguientes variables a tu archivo `.env`:

```bash
# URLs de la aplicación
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5050

# Configuración de Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Configuración de sesión
SESSION_SECRET=utassets_session_secret_2024

# JWT Secret (si no está ya configurado)
JWT_SECRET=utassets_secret_key_2024_secure_token

# Configuración de entorno
NODE_ENV=development
```

## Configuración en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Configura las URLs de redireccionamiento autorizadas:
   - `http://localhost:5050/api/auth/google/callback` (desarrollo)
   - `https://tu-dominio.com/api/auth/google/callback` (producción)
6. Configura los orígenes JavaScript autorizados:
   - `http://localhost:3000` (desarrollo)
   - `https://tu-dominio.com` (producción)

## Migración de base de datos

Ejecuta una migración para agregar el campo `google_id` a la tabla de usuarios:

```sql
ALTER TABLE user ADD COLUMN google_id VARCHAR(255) UNIQUE;
```

## Flujo de autenticación

1. Usuario hace clic en "Login con Google"
2. Frontend redirige a `/api/auth/google`
3. Google maneja la autenticación
4. Google redirige a `/api/auth/google/callback`
5. Backend procesa la respuesta, crea/actualiza el usuario
6. Backend establece una cookie HTTP-only con el JWT
7. Backend redirige al frontend con éxito
8. Frontend detecta la autenticación exitosa y redirige al dashboard 