# Configuración del Sistema de Correo Electrónico

Este sistema incluye confirmación por correo electrónico para el registro de nuevos usuarios.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Configuración de Email para confirmación de cuentas
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com

# URL del frontend (para enlaces de confirmación)
FRONTEND_URL=http://localhost:3000
```

## Configuración para Gmail

1. **Habilita la autenticación de 2 factores** en tu cuenta de Gmail.

2. **Genera una contraseña de aplicación**:
   - Ve a tu cuenta de Google
   - Seguridad → Autenticación en dos pasos → Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `EMAIL_PASS`

3. **Configura las variables**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASS=contraseña_de_aplicacion_generada
   EMAIL_FROM=noreply@tudominio.com
   ```

## Otras Opciones de Proveedor de Email

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=tu_api_key_de_sendgrid
```

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@outlook.com
EMAIL_PASS=tu_contraseña
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@yahoo.com
EMAIL_PASS=contraseña_de_aplicacion
```

## Flujo de Confirmación de Email

1. **Registro**: Usuario se registra en `/register`
2. **Envío de Email**: Sistema envía correo de confirmación automáticamente
3. **Confirmación**: Usuario hace clic en el enlace del correo
4. **Activación**: Cuenta se activa y puede iniciar sesión
5. **Login Bloqueado**: Usuarios no confirmados no pueden iniciar sesión
6. **⭐ Reenvío Automático**: Si un usuario no confirmado intenta hacer login, se envía automáticamente un nuevo correo de confirmación con token renovado (24 horas nuevas)

## Endpoints Agregados

- `POST /api/users/confirm-email` - Confirma el email con token
- `POST /api/users/resend-confirmation` - Reenvía correo de confirmación

## Campos Agregados a la Base de Datos

- `is_email_confirmed` (boolean) - Estado de confirmación
- `email_confirmation_token` (varchar) - Token único de confirmación
- `email_confirmation_token_expires` (timestamp) - Fecha de expiración del token

## Funcionalidades Incluidas

- ✅ Envío automático de correo de confirmación al registrarse
- ✅ Validación de tokens de confirmación
- ✅ Expiración de tokens (24 horas)
- ✅ Bloqueo de login para usuarios no confirmados
- ✅ **⭐ Reenvío automático al intentar login sin confirmar**
- ✅ Reenvío manual de correos de confirmación
- ✅ Confirmación automática para usuarios de Google OAuth
- ✅ Interfaz de usuario para gestionar confirmaciones
- ✅ Tokens renovados con 24 horas nuevas en cada reenvío
- ✅ Plantillas de correo diferenciadas para registros nuevos vs. reenvíos

## Pruebas

Para probar el sistema:

1. Configura las variables de entorno de email
2. Registra un nuevo usuario
3. Revisa tu bandeja de entrada para el correo de confirmación
4. Haz clic en el enlace de confirmación
5. Intenta iniciar sesión

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- Verifica que tengas la autenticación de 2 factores habilitada
- Usa una contraseña de aplicación, no tu contraseña normal de Gmail

### Los correos no llegan
- Revisa la carpeta de spam
- Verifica las configuraciones de EMAIL_HOST y EMAIL_PORT
- Confirma que las credenciales sean correctas

### Error de conexión SMTP
- Verifica que `EMAIL_SECURE` esté en `false` para puerto 587
- Para puerto 465, usa `EMAIL_SECURE=true` 